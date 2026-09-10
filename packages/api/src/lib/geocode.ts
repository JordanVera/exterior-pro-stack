import { formatPropertyAddress, type PropertyAddress } from './property-image';

export type GeoPoint = { latitude: number; longitude: number };

function getApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || null;
}

export async function geocodeAddress(
  property: PropertyAddress,
): Promise<GeoPoint | null> {
  const key = getApiKey();
  if (!key) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?${new URLSearchParams(
    {
      address: formatPropertyAddress(property),
      key,
    },
  )}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = (await res.json()) as {
      status?: string;
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    const location = body.results?.[0]?.geometry?.location;
    if (
      body.status !== 'OK' ||
      typeof location?.lat !== 'number' ||
      typeof location?.lng !== 'number'
    ) {
      return null;
    }
    return { latitude: location.lat, longitude: location.lng };
  } catch (err) {
    console.error('Geocode failed:', err);
    return null;
  }
}
