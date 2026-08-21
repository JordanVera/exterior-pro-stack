'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const;

export function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: keyof typeof SIZE;
  readOnly?: boolean;
}) {
  const interactive = Boolean(onChange) && !readOnly;

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        if (!interactive) {
          return (
            <Star
              key={star}
              className={cn(
                SIZE[size],
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/35',
              )}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="rounded-md p-0.5 transition hover:scale-110"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            aria-checked={filled}
            role="radio"
          >
            <Star
              className={cn(
                SIZE[size],
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/35',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function RatingSummary({
  average,
  count,
  size = 'sm',
  emptyLabel = 'New',
}: {
  average: number | null | undefined;
  count: number | undefined;
  size?: 'sm' | 'md';
  emptyLabel?: string;
}) {
  if (!count || average == null) {
    return (
      <span className="text-xs text-muted-foreground">{emptyLabel}</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <StarRating value={Math.round(average)} readOnly size={size} />
      <span
        className={cn(
          'font-semibold text-foreground',
          size === 'md' ? 'text-sm' : 'text-xs',
        )}
      >
        {average.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </span>
  );
}
