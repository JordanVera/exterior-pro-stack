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
  className,
}: {
  actions: QuickAction[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.id}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-brand-lime/40 hover:bg-brand-lime/5"
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
