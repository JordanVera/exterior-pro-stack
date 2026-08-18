'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

/**
 * Animated segmented control. The active pill is a shared layout element, so
 * it slides between options instead of popping.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  layoutId = 'segmented-tabs',
  className,
  size = 'md',
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-background/70 p-1 backdrop-blur-xl',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex items-center gap-2 rounded-full font-semibold transition-colors',
              size === 'sm'
                ? 'px-3.5 py-1.5 text-xs'
                : 'px-5 py-2.5 text-sm',
              active
                ? 'text-brand-ink'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="absolute inset-0 rounded-full bg-brand-lime shadow-sm shadow-brand-lime/30"
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
