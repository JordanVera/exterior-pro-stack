import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { pickAndCompressPhoto, uploadJobPhotoFile } from '@/lib/job-photos';
import { queryClient } from '@/lib/query';
import type { FieldJob } from '@/lib/types';

type Photo = FieldJob['photos'][number];
type Kind = 'BEFORE' | 'AFTER';

function invalidateJob(jobId: string) {
  return queryClient.invalidateQueries({ queryKey: ['jobs'] });
}

function PhotoSection({
  title,
  kind,
  photos,
  jobId,
  token,
  canEdit,
  busyKind,
  setBusyKind,
}: {
  title: string;
  kind: Kind;
  photos: Photo[];
  jobId: string;
  token: string | null;
  canEdit: boolean;
  busyKind: Kind | null;
  setBusyKind: (kind: Kind | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const loading = busyKind === kind;

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => trpc.job.deletePhoto.mutate({ photoId }),
    onSuccess: () => invalidateJob(jobId),
  });

  const addPhoto = async (source: 'camera' | 'library') => {
    if (!token) {
      Alert.alert('Sign in required', 'Sign in again to upload photos.');
      return;
    }
    try {
      const uri = await pickAndCompressPhoto(source);
      if (!uri) return;
      setBusyKind(kind);
      await uploadJobPhotoFile({ jobId, kind, uri, token });
      await invalidateJob(jobId);
    } catch (error) {
      Alert.alert(
        'Could not add photo',
        error instanceof Error ? error.message : 'Try again',
      );
    } finally {
      setBusyKind(null);
    }
  };

  const confirmDelete = (photo: Photo) => {
    Alert.alert('Remove photo?', 'This photo will be deleted from the job.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(photo.id, {
            onError: (error) =>
              Alert.alert(
                'Could not remove photo',
                error instanceof Error ? error.message : 'Try again',
              ),
          }),
      },
    ]);
  };

  return (
    <View className="mt-4">
      <Text className="mb-3 text-lg font-semibold text-white">{title}</Text>
      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {photos.map((photo) => (
            <Pressable
              key={photo.id}
              onPress={() => setPreview(photo.url)}
              onLongPress={canEdit ? () => confirmDelete(photo) : undefined}
              className="relative mr-3"
            >
              <Image
                source={{ uri: photo.url }}
                className="rounded-2xl bg-navy-700"
                style={{ width: 112, height: 112 }}
              />
              {canEdit ? (
                <Pressable
                  onPress={() => confirmDelete(photo)}
                  className="absolute top-1 right-1 justify-center items-center w-7 h-7 rounded-full bg-black/70"
                >
                  <Text className="text-sm font-bold text-white">×</Text>
                </Pressable>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <Text className="mb-3 text-sm text-slate-400">No photos yet</Text>
      )}

      {canEdit ? (
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => addPhoto('camera')}
            disabled={loading}
            className={`flex-1 items-center rounded-2xl bg-navy-700 px-3 py-4 ${loading ? 'opacity-50' : ''}`}
          >
            <Text className="text-sm font-semibold text-center text-white">
              {loading ? 'Uploading…' : 'Take photo'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => addPhoto('library')}
            disabled={loading}
            className={`flex-1 items-center rounded-2xl bg-navy-700 px-3 py-4 ${loading ? 'opacity-50' : ''}`}
          >
            <Text className="text-sm font-semibold text-center text-white">
              Choose from library
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={Boolean(preview)} animationType="fade" transparent>
        <Pressable
          className="flex-1 justify-center items-center bg-black/90"
          onPress={() => setPreview(null)}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

export function JobPhotos({
  job,
  token,
}: {
  job: FieldJob;
  token: string | null;
}) {
  const [busyKind, setBusyKind] = useState<Kind | null>(null);
  const photos = job.photos ?? [];
  const canEdit = job.status !== 'COMPLETED' && job.status !== 'CANCELLED';
  const before = photos.filter((photo) => photo.kind === 'BEFORE');
  const after = photos.filter((photo) => photo.kind === 'AFTER');

  return (
    <View className="mt-8">
      <Text className="text-xl font-bold text-white">Job photos</Text>
      <Text className="mt-1 text-sm text-slate-400">
        Add at least one before and one after photo to complete this job.
      </Text>
      <PhotoSection
        title="Before"
        kind="BEFORE"
        photos={before}
        jobId={job.id}
        token={token}
        canEdit={canEdit}
        busyKind={busyKind}
        setBusyKind={setBusyKind}
      />
      <PhotoSection
        title="After"
        kind="AFTER"
        photos={after}
        jobId={job.id}
        token={token}
        canEdit={canEdit}
        busyKind={busyKind}
        setBusyKind={setBusyKind}
      />
    </View>
  );
}

export function hasBeforeAndAfterPhotos(photos: { kind: string }[]) {
  return (
    photos.some((photo) => photo.kind === 'BEFORE') &&
    photos.some((photo) => photo.kind === 'AFTER')
  );
}
