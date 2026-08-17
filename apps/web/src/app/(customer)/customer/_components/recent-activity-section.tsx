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
  job?: { id: string; service: any; property: any };
}

interface RecentActivitySectionProps {
  items: ActivityItem[];
  onRebook?: (job: { id: string; service: any; property: any }) => void;
}

export function RecentActivitySection({ items, onRebook }: RecentActivitySectionProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Recent Activity
      </h2>
      <div className="space-y-1 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className={cn('h-3.5 w-3.5', item.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
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
                <span className="text-[11px] text-muted-foreground">
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
