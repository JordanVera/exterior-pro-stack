import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Consistent section chrome across both dashboards: a title row with an
 * optional count pill and "view all" link, over a frosted body panel.
 */
export function SectionPanel({
  title,
  count,
  viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,
  /** Renders the children bare, without the frosted panel around them. */
  bare = false,
}: {
  title: string;
  count?: number;
  viewAll?: { href: string; label?: string };
  headerSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  bare?: boolean;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {typeof count === 'number' && count > 0 ? (
            <span className="rounded-full bg-brand-lime/10 px-2 py-0.5 text-xs font-semibold text-brand-navy dark:text-brand-lime">
              {count}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {headerSlot}
          {viewAll ? (
            <Link
              href={viewAll.href}
              className="text-xs font-semibold text-brand-navy transition-colors hover:text-brand-navy/70 dark:text-brand-lime dark:hover:text-brand-lime/80"
            >
              {viewAll.label ?? 'View all'}
            </Link>
          ) : null}
        </div>
      </div>

      {bare ? (
        children
      ) : (
        <div
          className={cn(
            'rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-xl',
            bodyClassName,
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}
