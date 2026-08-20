'use client';

import { useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import {
  MAX_SERVICE_ZIPS,
  parseZipCodes,
  US_ZIP,
} from '@repo/validators';
import { cn } from '@/lib/utils';

export function ZipCodeInput({
  id,
  value,
  onChange,
  disabled,
  placeholder = '77008',
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const zips = value ? value.split(',').filter(Boolean) : [];

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return true;

    const { zips: parsed, invalid } = parseZipCodes(`${value},${trimmed}`);
    if (invalid.length > 0 && parsed.length === zips.length) {
      setError(`Invalid ZIP code: ${invalid[0]}`);
      return false;
    }
    if (parsed.length > MAX_SERVICE_ZIPS) {
      setError(`You can add up to ${MAX_SERVICE_ZIPS} ZIP codes`);
      return false;
    }

    setError(
      invalid.length > 0 ? `Skipped invalid: ${invalid.join(', ')}` : '',
    );
    onChange(parsed.join(','));
    setDraft('');
    return true;
  };

  const remove = (zip: string) => {
    onChange(zips.filter((item) => item !== zip).join(','));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !draft && zips.length > 0) {
      event.preventDefault();
      onChange(zips.slice(0, -1).join(','));
      setError('');
      return;
    }

    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      if (!draft.trim()) return;
      event.preventDefault();
      commit(draft);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!/[,\s;]/.test(text) && text.length <= 10) return;
    event.preventDefault();
    commit(`${draft}${text}`);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-brand-lime',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {zips.map((zip) => (
          <span
            key={zip}
            className="inline-flex items-center gap-1 rounded-full border border-brand-lime/30 bg-brand-lime/10 px-2 py-0.5 text-xs font-medium text-foreground"
          >
            {zip}
            <button
              type="button"
              onClick={() => remove(zip)}
              disabled={disabled}
              className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${zip}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder={zips.length === 0 ? placeholder : 'Add another'}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d]/g, '').slice(0, 5);
            setError('');
            if (next.length === 5 && US_ZIP.test(next)) {
              commit(next);
              return;
            }
            setDraft(next);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => {
            if (draft) commit(draft);
          }}
          className="min-w-[7rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
