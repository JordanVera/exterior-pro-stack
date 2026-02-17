'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, RotateCcw } from 'lucide-react';
import type { PropertySummary } from './utils';

interface PropertySectionProps {
  summaries: PropertySummary[];
  onRequestJob: (property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }) => void;
  onRebook: (job: {
    id: string;
    service: any;
    property: any;
  }) => void;
}

export function PropertySection({
  summaries,
  onRequestJob,
  onRebook,
}: PropertySectionProps) {
  const router = useRouter();

  if (summaries.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          My Homes
        </h2>
        <Card className="border-dashed shadow-none">
          <CardContent className="py-10 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
            <p className="mb-3 text-sm text-neutral-500">
              Add your first property to get started.
            </p>
            <Button
              onClick={() => router.push('/customer/settings')}
              className="rounded-full bg-cyan-500 hover:bg-cyan-400"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Property
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          My Homes
        </h2>
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push('/customer/settings')}
          className="h-auto p-0 text-xs text-cyan-500 hover:text-cyan-400"
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
                'overflow-hidden shadow-none transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
              )}
            >
              <CardContent className="p-4 flex flex-col min-h-[140px]">
                <div className="flex items-start flex-1 gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 rounded-lg w-9 h-9 bg-cyan-500/10">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-neutral-900 dark:text-white">
                      {property.address}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {property.city}, {property.state}
                    </div>
                  </div>
                </div>

                {hasActivity && (
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    {activeJobsCount > 0 && (
                      <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-cyan-600 dark:text-cyan-400 font-medium">
                        {activeJobsCount} active
                      </span>
                    )}
                    {openJobsCount > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400 font-medium">
                        {openJobsCount} open
                      </span>
                    )}
                    {lastCompletedJob && (
                      <span className="block truncate text-neutral-500">
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

                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRequestJob(property)}
                    className="w-full text-xs rounded-full h-7"
                  >
                    Request job
                  </Button>
                  {lastCompletedJob && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onRebook({
                          id: lastCompletedJob.id,
                          service: lastCompletedJob.service,
                          property: lastCompletedJob.property,
                        })
                      }
                      className="w-full text-xs rounded-full h-7 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
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
