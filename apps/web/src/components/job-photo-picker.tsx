'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  MAX_JOB_PHOTO_BYTES,
  MAX_JOB_REQUEST_PHOTOS,
  validateJobPhotoFile,
} from '@/lib/job-photos';

export type PendingJobPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export function JobPhotoPicker({
  photos,
  onChange,
  className,
}: {
  photos: PendingJobPhoto[];
  onChange: (photos: PendingJobPhoto[]) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const [error, setError] = useState('');

  const addFiles = (files: FileList | File[]) => {
    setError('');
    const next = [...photos];
    const list = Array.from(files);

    for (const file of list) {
      if (next.length >= MAX_JOB_REQUEST_PHOTOS) {
        setError(`You can attach up to ${MAX_JOB_REQUEST_PHOTOS} photos`);
        break;
      }

      const validationError = validateJobPhotoFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    onChange(next);
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((photo) => photo.id !== id));
    setError('');
  };

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl),
      );
    };
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2 justify-between items-center">
        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Reference photos (optional)
        </label>
        <span className="text-[11px] text-muted-foreground">
          {photos.length}/{MAX_JOB_REQUEST_PHOTOS}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="overflow-hidden relative w-20 h-20 rounded-xl border group border-border bg-muted"
          >
            <img
              src={photo.previewUrl}
              alt="Selected reference photo"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              className="inline-flex absolute top-1 right-1 justify-center items-center w-6 h-6 rounded-full border opacity-0 transition-opacity border-border bg-background/90 text-muted-foreground hover:text-foreground group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX_JOB_REQUEST_PHOTOS ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col gap-1 justify-center items-center w-20 h-20 rounded-xl border border-dashed transition-colors border-border bg-muted/40 text-muted-foreground hover:border-brand-lime/50 hover:text-foreground"
          >
            <ImagePlus className="w-4 h-4" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            addFiles(event.target.files);
          }
          event.target.value = '';
        }}
      />

      <p className="text-[11px] text-muted-foreground">
        Help providers understand the job. JPEG, PNG, or WebP up to{' '}
        {Math.round(MAX_JOB_PHOTO_BYTES / (1024 * 1024))}MB each.
      </p>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      {photos.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="px-0 h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          Add more photos
        </Button>
      ) : null}
    </div>
  );
}

export function clearPendingJobPhotos(photos: PendingJobPhoto[]) {
  photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
}
