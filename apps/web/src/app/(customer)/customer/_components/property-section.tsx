'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, RotateCcw } from 'lucide-react';
import { requestJobPath, type PropertySummary } from './utils';

interface PropertySectionProps {
  summaries: PropertySummary[];
}

export function PropertySection({ summaries }: PropertySectionProps) {
  const router = useRouter();

  if (summaries.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          My Homes
        </h2>
        <Card className="border-dashed border-border bg-background/80 shadow-none backdrop-blur-xl">
          <CardContent className="py-10 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="mb-3 text-sm text-muted-foreground">
              Add your first property to get started.
            </p>
            <Button
              onClick={() => router.push('/customer/settings')}
              className="rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Property
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">My Homes</h2>
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push('/customer/settings')}
          className="h-auto p-0 text-xs text-brand-navy hover:text-brand-navy/70 dark:text-brand-lime dark:hover:text-brand-lime/80"
        >
          Manage
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {summaries.map((summary) => {
          const {
            property,
            activeJobsCount,
            openJobsCount,
            lastCompletedJob,
          } = summary;
          const hasActivity =
            activeJobsCount > 0 || openJobsCount > 0 || lastCompletedJob;

          return (
            <Card
              key={property.id}
              className={cn(
                'overflow-hidden border-border bg-background/80 shadow-none backdrop-blur-xl transition-all duration-200',
                'hover:-translate-y-0.5 hover:border-brand-lime/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
              )}
            >
              <CardContent className="flex min-h-[140px] flex-col p-4">
                <div className="flex flex-1 items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-lime/10">
                    <MapPin className="h-4 w-4 text-brand-lime" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {property.address}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {property.city}, {property.state}
                    </div>
                  </div>
                </div>

                {hasActivity && (
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    {activeJobsCount > 0 && (
                      <span className="rounded-full bg-brand-lime/10 px-2 py-0.5 font-medium text-brand-navy dark:text-brand-lime">
                        {activeJobsCount} active
                      </span>
                    )}
                    {openJobsCount > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                        {openJobsCount} open
                      </span>
                    )}
                    {lastCompletedJob && (
                      <span className="block truncate text-muted-foreground">
                        Last: {lastCompletedJob.serviceName}{' '}
                        {new Date(
                          lastCompletedJob.completedAt,
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        requestJobPath({ propertyId: property.id }),
                      )
                    }
                    className="h-7 w-full rounded-full text-xs"
                  >
                    Request job
                  </Button>
                  {lastCompletedJob && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(
                          requestJobPath({
                            serviceId: lastCompletedJob.service.id,
                            propertyId: lastCompletedJob.property.id,
                          }),
                        )
                      }
                      className="h-7 w-full rounded-full text-xs text-brand-navy hover:bg-brand-lime/10 dark:text-brand-lime"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Book again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
