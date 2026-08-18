export const MAX_JOB_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_JOB_REQUEST_PHOTOS = 6;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function normalizeContentType(type: string) {
  const value = type.toLowerCase().split(';')[0]?.trim();
  if (value === 'image/jpg') return 'image/jpeg';
  return value;
}

export function validateJobPhotoFile(file: File): string | null {
  const contentType = normalizeContentType(file.type);
  if (!ALLOWED_TYPES.has(contentType)) {
    return 'Photos must be JPEG, PNG, or WebP';
  }
  if (file.size === 0) {
    return 'Photo file is empty';
  }
  if (file.size > MAX_JOB_PHOTO_BYTES) {
    return 'Each photo must be 8MB or smaller';
  }
  return null;
}

export async function uploadJobPhotoFile(opts: {
  jobId: string;
  kind: 'BEFORE' | 'AFTER';
  file: File;
}) {
  const form = new FormData();
  form.append('file', opts.file);
  form.append('kind', opts.kind);

  const res = await fetch(`/api/jobs/${opts.jobId}/photos`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  let body: { error?: string } | null = null;
  try {
    body = (await res.json()) as { error?: string };
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(body?.error || `Upload failed (${res.status})`);
  }

  return body;
}
