export const MAX_PROVIDER_LOGO_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function normalizeContentType(type: string) {
  const value = type.toLowerCase().split(';')[0]?.trim();
  if (value === 'image/jpg') return 'image/jpeg';
  return value;
}

export function validateProviderLogoFile(file: File): string | null {
  const contentType = normalizeContentType(file.type);
  if (!ALLOWED_TYPES.has(contentType)) {
    return 'Logos must be JPEG, PNG, or WebP';
  }
  if (file.size === 0) {
    return 'Logo file is empty';
  }
  if (file.size > MAX_PROVIDER_LOGO_BYTES) {
    return 'Logo must be 2MB or smaller';
  }
  return null;
}

export async function uploadProviderLogoFile(file: File) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/provider/logo', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  let body: { url?: string; pathname?: string; error?: string } | null = null;
  try {
    body = (await res.json()) as {
      url?: string;
      pathname?: string;
      error?: string;
    };
  } catch {
    body = null;
  }

  if (!res.ok || !body?.url || !body.pathname) {
    throw new Error(body?.error || `Upload failed (${res.status})`);
  }

  return { url: body.url, pathname: body.pathname };
}

export async function deleteProviderLogoFile() {
  const res = await fetch('/api/provider/logo', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    let body: { error?: string } | null = null;
    try {
      body = (await res.json()) as { error?: string };
    } catch {
      body = null;
    }
    throw new Error(body?.error || `Remove failed (${res.status})`);
  }
}
