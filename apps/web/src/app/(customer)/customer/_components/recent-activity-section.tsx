'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { requestJobPath } from './utils';

export interface ActivityItem {
  id: string;
  jobId: string;
  icon: LucideIcon;
  color: string;
  title: string;
  sub: string;
  time: string;
  job?: { id: string; service: { id: string }; property: { id: string } };
}

interface RecentActivitySectionProps {
  items: ActivityItem[];
}

export function RecentActivitySection({ items }: RecentActivitySectionProps) {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Recent Activity
      </h2>
      <div className="p-4 space-y-1 rounded-2xl border backdrop-blur-xl border-border bg-background/80">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={`/customer/jobs/${item.jobId}`}
              className="flex items-center gap-3 rounded-lg py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-shrink-0 justify-center items-center w-7 h-7 rounded-full bg-muted">
                <Icon className={cn('h-3.5 w-3.5', item.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate text-foreground">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
              <div className="flex flex-shrink-0 gap-2 items-center">
                {item.job && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(
                        requestJobPath({
                          serviceId: item.job!.service.id,
                          propertyId: item.job!.property.id,
                        }),
                      );
                    }}
                    className="h-6 px-2 text-[11px] text-brand-navy hover:bg-brand-lime/10 dark:text-brand-lime"
                  >
                    <RotateCcw className="mr-1 w-3 h-3" />
                    Book again
                  </Button>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {item.time}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
