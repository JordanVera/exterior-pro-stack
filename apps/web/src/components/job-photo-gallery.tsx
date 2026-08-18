'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

export type JobPhotoItem = {
  id: string;
  url: string;
  kind: 'BEFORE' | 'AFTER' | string;
};

export function jobHasBeforeAndAfter(photos?: JobPhotoItem[] | null) {
  const list = photos ?? [];
  return (
    list.some((photo) => photo.kind === 'BEFORE') &&
    list.some((photo) => photo.kind === 'AFTER')
  );
}

function PhotoRow({
  label,
  photos,
  onOpen,
}: {
  label: string;
  photos: JobPhotoItem[];
  onOpen: (photo: JobPhotoItem) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {photos.length === 0 ? (
        <p className="text-xs text-muted-foreground">None yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpen(photo)}
              className="overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img
                src={photo.url}
                alt={`${label} photo`}
                className="h-20 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function JobPhotoGallery({
  photos,
}: {
  photos?: JobPhotoItem[] | null;
}) {
  const list = photos ?? [];
  const before = list.filter((photo) => photo.kind === 'BEFORE');
  const after = list.filter((photo) => photo.kind === 'AFTER');
  const [active, setActive] = useState<JobPhotoItem | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <PhotoRow label="Before" photos={before} onOpen={setActive} />
        <PhotoRow label="After" photos={after} onOpen={setActive} />
      </div>
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl border-none bg-black p-2 sm:rounded-xl">
          <DialogTitle className="sr-only">
            {active?.kind === 'AFTER' ? 'After photo' : 'Before photo'}
          </DialogTitle>
          {active ? (
            <img
              src={active.url}
              alt={active.kind === 'AFTER' ? 'After photo' : 'Before photo'}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
