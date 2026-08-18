'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Counter } from '@/components/ui/counter';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

export type StatTile = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  caption?: string;
  icon: LucideIcon;
  href?: string;
  tone?: 'lime' | 'amber' | 'blue' | 'green' | 'muted';
};

const TONES: Record<NonNullable<StatTile['tone']>, string> = {
  lime: 'border-brand-lime/25 bg-brand-lime/10 text-brand-lime',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-500',
  blue: 'border-blue-500/25 bg-blue-500/10 text-blue-500',
  green: 'border-green-500/25 bg-green-500/10 text-green-500',
  muted: 'border-border bg-muted text-muted-foreground',
};

/**
 * At-a-glance number row. The count-up runs once on mount and then the tiles
 * are completely still.
 */
export function StatTiles({
  tiles,
  className,
}: {
  tiles: StatTile[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5',
        className,
      )}
    >
      {tiles.map((tile, index) => (
        <motion.div
          key={tile.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 + index * 0.05 }}
          className="relative"
        >
          <StatTileBody tile={tile} />
        </motion.div>
      ))}
    </div>
  );
}

function StatTileBody({ tile }: { tile: StatTile }) {
  const Icon = tile.icon;
  const tone = TONES[tile.tone ?? 'lime'];

  const body = (
    <div
      className={cn(
        'relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-xl transition-colors',
        tile.href && 'hover:border-brand-lime/50',
      )}
    >
      <GlowingEffect
        disabled={false}
        glow
        proximity={64}
        spread={26}
        borderWidth={2}
      />

      <div className="flex relative gap-2 justify-between items-start">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {tile.label}
        </p>
        <span
          className={cn(
            'flex justify-center items-center w-8 h-8 rounded-lg border shrink-0',
            tone,
          )}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>

      <div className="relative mt-5">
        <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <Counter
            value={tile.value}
            prefix={tile.prefix}
            suffix={tile.suffix}
            decimals={tile.decimals}
            duration={900}
          />
        </p>
        {tile.caption ? (
          <p className="mt-1 text-xs truncate text-muted-foreground">
            {tile.caption}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!tile.href) return body;

  return (
    <Link href={tile.href} className="block h-full">
      {body}
    </Link>
  );
}
