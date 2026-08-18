import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File, UploadType } from 'expo-file-system';
import { getBaseUrl } from './trpc';

const MAX_EDGE = 1600;

export async function pickAndCompressPhoto(source: 'camera' | 'library') {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Camera access is required to take job photos.');
    }
  } else {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Photo library access is required to attach job photos.');
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
    exif: false,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const width = asset.width || MAX_EDGE;
  const height = asset.height || MAX_EDGE;
  const actions =
    Math.max(width, height) > MAX_EDGE
      ? width >= height
        ? [{ resize: { width: MAX_EDGE } }]
        : [{ resize: { height: MAX_EDGE } }]
      : [];

  const compressed = await manipulateAsync(asset.uri, actions, {
    compress: 0.8,
    format: SaveFormat.JPEG,
  });

  return compressed.uri;
}

export async function uploadJobPhotoFile(opts: {
  jobId: string;
  kind: 'BEFORE' | 'AFTER';
  uri: string;
  token: string;
}) {
  const result = await new File(opts.uri).upload(
    `${getBaseUrl()}/api/jobs/${opts.jobId}/photos`,
    {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'image/jpeg',
      parameters: { kind: opts.kind },
      headers: {
        Authorization: `Bearer ${opts.token}`,
      },
    },
  );

  let body: { error?: string } | null = null;
  try {
    body = JSON.parse(result.body) as { error?: string };
  } catch {
    body = null;
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(body?.error || `Upload failed (${result.status})`);
  }

  return body;
}
