'use client';

import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERVICE_TICKER, TRUST_ITEMS } from './data';

function TickerRow({
  items,
  direction,
  duration,
}: {
  items: readonly string[];
  direction: 'forwards' | 'reverse';
  duration: string;
}) {
  // The scroll keyframe shifts by -50% - 0.5rem, so the list must be doubled
  // and use a 1rem gap for a seamless loop.
  const doubled = [...items, ...items];

  return (
    <div
      className="flex overflow-hidden group"
      style={
        {
          '--animation-duration': duration,
          '--animation-direction': direction,
        } as React.CSSProperties
      }
    >
      <ul className="flex w-max shrink-0 animate-scroll flex-nowrap items-center gap-4 pr-4 group-hover:[animation-play-state:paused]">
        {doubled.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex shrink-0 items-center gap-2.5 rounded-full border border-border/60 bg-background/60 px-5 py-2.5 backdrop-blur"
          >
            <Leaf className="h-3.5 w-3.5 shrink-0 text-brand-lime" />
            <span className="text-sm font-medium whitespace-nowrap text-foreground">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServiceTicker({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'overflow-hidden relative py-8 border-y border-border/60 bg-background/40',
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent pointer-events-none from-brand-mist via-brand-mist/80 sm:w-40 dark:from-brand-night dark:via-brand-night/80" />
      <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l to-transparent pointer-events-none from-brand-mist via-brand-mist/80 sm:w-40 dark:from-brand-night dark:via-brand-night/80" />

      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Every exterior service, one platform
      </p>

      <div className="space-y-4">
        <TickerRow items={SERVICE_TICKER} direction="forwards" duration="60s" />
        <TickerRow
          items={[...SERVICE_TICKER].reverse()}
          direction="reverse"
          duration="75s"
        />
      </div>

      <div className="grid gap-6 px-6 mx-auto mt-10 max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.value}
            className="pl-4 border-l-2 border-brand-lime/40"
          >
            <p className="text-sm font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
