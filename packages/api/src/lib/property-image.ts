import { del, put } from '@vercel/blob';
import type { PrismaClient, Property, PropertyImageSource } from '@repo/db';

// Use Web Crypto API which works in both Node.js and Edge Runtime
function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Cached exterior photo for a property.
 *
 * Street View is preferred because Exterior Pro sells work you can see from the
 * curb (siding, paint, windows), but coverage is patchy on rural and private
 * roads, so we fall back to a satellite tile. Google is called at most once per
 * address: the bytes are mirrored to Blob and the URL is stored on the row.
 *
 * Every export here is non-fatal. With no API key configured the helpers
 * quietly no-op and the UI keeps its illustrated fallback.
 */

const STREET_VIEW_METADATA =
  'https://maps.googleapis.com/maps/api/streetview/metadata';
const STREET_VIEW_IMAGE = 'https://maps.googleapis.com/maps/api/streetview';
const STATIC_MAP = 'https://maps.googleapis.com/maps/api/staticmap';

/** 2x the rendered card band, so the photo stays sharp on retina displays. */
const IMAGE_SIZE = { width: 640, height: 320 };
const FETCH_TIMEOUT_MS = 8_000;

export type PropertyAddress = Pick<
  Property,
  'address' | 'city' | 'state' | 'zip'
>;

export function formatPropertyAddress(property: PropertyAddress) {
  return `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
}

function getApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || null;
}

export function propertyImagesEnabled() {
  return getApiKey() !== null;
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * The metadata endpoint is free and unmetered, so we always ask it whether a
 * panorama exists before spending a billable Street View image request.
 */
async function hasStreetView(address: string, key: string) {
  const url = `${STREET_VIEW_METADATA}?${new URLSearchParams({
    location: address,
    key,
  })}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return false;
  const body = (await res.json()) as { status?: string };
  return body.status === 'OK';
}

function streetViewUrl(address: string, key: string) {
  return `${STREET_VIEW_IMAGE}?${new URLSearchParams({
    location: address,
    size: `${IMAGE_SIZE.width}x${IMAGE_SIZE.height}`,
    fov: '70',
    pitch: '10',
    return_error_code: 'true',
    key,
  })}`;
}

function satelliteUrl(address: string, key: string) {
  return `${STATIC_MAP}?${new URLSearchParams({
    center: address,
    size: `${IMAGE_SIZE.width}x${IMAGE_SIZE.height}`,
    zoom: '19',
    maptype: 'satellite',
    scale: '1',
    key,
  })}`;
}

async function downloadImage(url: string) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength === 0) return null;
  return { buffer, contentType: contentType.split(';')[0]!.trim() };
}

/**
 * Fetches the best available imagery for an address and mirrors it to Blob.
 * Returns null when no key is configured or the address has no coverage.
 */
async function fetchPropertyImage(propertyId: string, address: string) {
  const key = getApiKey();
  if (!key) return null;

  const useStreetView = await hasStreetView(address, key).catch(() => false);
  const source: PropertyImageSource = useStreetView
    ? 'STREET_VIEW'
    : 'SATELLITE';
  const image = await downloadImage(
    useStreetView ? streetViewUrl(address, key) : satelliteUrl(address, key),
  );
  if (!image) return null;

  const extension = image.contentType === 'image/png' ? 'png' : 'jpg';
  const blob = await put(
    `properties/${propertyId}/${randomUUID()}.${extension}`,
    image.buffer,
    {
      access: 'public',
      addRandomSuffix: false,
      contentType: image.contentType,
    },
  );

  return { url: blob.url, pathname: blob.pathname, source };
}

/** Removes a previously cached photo from Blob. Safe to call with nulls. */
export async function deletePropertyImage(
  property: Pick<Property, 'imageUrl'>,
) {
  if (!property.imageUrl) return;
  await del(property.imageUrl).catch(() => undefined);
}

/**
 * Fetches and stores the photo for a property. Never throws: a maps outage or
 * a missing key must not break creating or editing a property.
 */
export async function refreshPropertyImage(opts: {
  db: PrismaClient;
  property: Property;
}): Promise<Property> {
  const { db, property } = opts;
  if (!propertyImagesEnabled()) return property;

  try {
    const image = await fetchPropertyImage(
      property.id,
      formatPropertyAddress(property),
    );

    // Stamp imageCheckedAt either way; a miss means the address has no
    // coverage, and retrying it on every render would be wasted spend.
    const updated = await db.property.update({
      where: { id: property.id },
      data: {
        imageUrl: image?.url ?? null,
        imagePathname: image?.pathname ?? null,
        imageSource: image?.source ?? null,
        imageCheckedAt: new Date(),
      },
    });

    if (property.imageUrl && property.imageUrl !== updated.imageUrl) {
      await deletePropertyImage(property);
    }

    return updated;
  } catch (error) {
    console.error(
      `Property image refresh failed for ${property.id}:`,
      error instanceof Error ? error.message : error,
    );
    return property;
  }
}

/** True when the address changed in a way that invalidates a cached photo. */
export function addressChanged(
  before: PropertyAddress,
  after: PropertyAddress,
) {
  return formatPropertyAddress(before) !== formatPropertyAddress(after);
}
