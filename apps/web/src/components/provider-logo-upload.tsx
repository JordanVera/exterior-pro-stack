'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import {
  deleteProviderLogoFile,
  uploadProviderLogoFile,
  validateProviderLogoFile,
} from '@/lib/provider-logo';
import { cn } from '@/lib/utils';

export type ProviderLogoValue = {
  url: string;
  pathname: string;
};

export function ProviderLogoUpload({
  value,
  onChange,
  disabled,
  onBusyChange,
}: {
  value: ProviderLogoValue | null;
  onChange: (next: ProviderLogoValue | null) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onBusyChange?.(busy);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateProviderLogoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setBusy(true);
    try {
      const logo = await uploadProviderLogoFile(file);
      onChange(logo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onRemove = async () => {
    setError('');
    setBusy(true);
    try {
      await deleteProviderLogoFile();
      onChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove logo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:border-brand-lime/50 hover:bg-brand-lime/5',
            (disabled || uploading) && 'cursor-not-allowed opacity-70',
          )}
          aria-label={value ? 'Replace business logo' : 'Upload business logo'}
        >
          {value ? (
            // Blob URLs are user-uploaded and change per business.
            <img
              src={value.url}
              alt="Business logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-4 w-4 animate-spin text-brand-lime" />
            </span>
          ) : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Business logo</p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, or WebP · 2MB max
          </p>
          {value ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled || uploading}
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
