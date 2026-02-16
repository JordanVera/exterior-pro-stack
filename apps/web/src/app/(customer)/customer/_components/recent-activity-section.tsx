import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  color: string;
  title: string;
  sub: string;
  time: string;
  job?: { id: string; quote: { service: any; property: any; provider: any } };
}

interface RecentActivitySectionProps {
  items: ActivityItem[];
  onRebook?: (job: { id: string; quote: { service: any; property: any; provider: any } }) => void;
}

export function RecentActivitySection({ items, onRebook }: RecentActivitySectionProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
        Recent Activity
      </h2>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              <div className="flex items-center justify-center flex-shrink-0 rounded-full w-7 h-7 bg-neutral-100 dark:bg-neutral-800/60">
                <Icon className={cn('w-3.5 h-3.5', item.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate text-neutral-900 dark:text-neutral-200">
                  {item.title}
                </div>
                <div className="text-xs text-neutral-500">{item.sub}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.job && onRebook && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRebook(item.job!);
                    }}
                    className="h-6 px-2 text-[11px] text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Book again
                  </Button>
                )}
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
