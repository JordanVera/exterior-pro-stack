'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/dashboard/section-panel';
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
    <SectionPanel title="Recent activity" bodyClassName="p-3">
      <ol className="relative">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;

          return (
            <li key={item.id} className="relative">
              {/* Connector runs between dots, so the last row skips it. */}
              {!isLast ? (
                <span className="absolute left-[1.4375rem] top-9 bottom-0 w-px bg-border" />
              ) : null}

              <Link
                href={`/customer/jobs/${item.jobId}`}
                className="group relative flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className={cn('h-3.5 w-3.5', item.color)} />
                </span>

                <span className="min-w-0 flex-1 pb-3">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm text-foreground">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {item.time}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.sub}
                  </span>

                  {item.job ? (
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
                      className="mt-1.5 h-6 rounded-full px-2 text-[11px] text-brand-navy hover:bg-brand-lime/10 dark:text-brand-lime"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Book again
                    </Button>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </SectionPanel>
  );
}
