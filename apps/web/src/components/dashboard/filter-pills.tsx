'use client';

import { cn } from '@/lib/utils';

export type FilterPill<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/**
 * Scrollable row of filter pills. Shared so the jobs list, the service picker,
 * and the payments filters all read identically.
 */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterPill<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
              active
                ? 'border-brand-lime bg-brand-lime text-brand-ink'
                : 'border-border bg-background/70 text-muted-foreground backdrop-blur-xl hover:border-brand-lime/50 hover:text-foreground',
            )}
          >
            {option.label}
            {typeof option.count === 'number' ? (
              <span
                className={cn(
                  'tabular-nums',
                  active ? 'text-brand-ink/70' : 'text-muted-foreground/70',
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
