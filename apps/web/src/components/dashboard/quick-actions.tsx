import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuickAction = {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
};

export function QuickActions({
  actions,
  orientation = 'list',
  className,
}: {
  actions: QuickAction[];
  /** "row" spreads the actions across the full width as standalone cards. */
  orientation?: 'list' | 'row';
  className?: string;
}) {
  const isRow = orientation === 'row';

  return (
    <div
      className={cn(
        isRow ? 'grid gap-2 sm:grid-cols-2 lg:grid-cols-4' : 'space-y-1',
        className,
      )}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.id}
            href={action.href}
            className={cn(
              'group flex items-center gap-3 rounded-xl border p-2.5 transition-all hover:border-brand-lime/40 hover:bg-brand-lime/5',
              isRow
                ? 'border-border bg-background/70 p-4 backdrop-blur-xl'
                : 'border-transparent',
            )}
          >
            <span className="flex justify-center items-center w-9 h-9 rounded-lg border shrink-0 border-brand-lime/25 bg-brand-lime/10">
              <Icon className="w-4 h-4 text-brand-lime" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium truncate text-foreground">
                {action.label}
              </span>
              {action.description ? (
                <span className="block text-xs truncate text-muted-foreground">
                  {action.description}
                </span>
              ) : null}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-lime" />
          </Link>
        );
      })}
    </div>
  );
}
