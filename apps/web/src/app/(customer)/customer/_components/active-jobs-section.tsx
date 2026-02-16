'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  status: string;
  scheduledDate?: string | null;
  createdAt: string;
  quote: {
    service: { name: string };
    property: { address: string };
  };
}

interface ActiveJobsSectionProps {
  jobs: Job[];
}

export function ActiveJobsSection({ jobs }: ActiveJobsSectionProps) {
  const router = useRouter();

  if (jobs.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Active Jobs
        </h2>
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push('/customer/jobs')}
          className="h-auto p-0 text-xs text-cyan-500 hover:text-cyan-400"
        >
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {jobs.slice(0, 3).map((job) => (
          <Card key={job.id} className="shadow-none">
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {job.quote.service.name}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5 truncate">
                  {job.quote.property.address}
                  {job.scheduledDate &&
                    ` · ${new Date(job.scheduledDate).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                      },
                    )}`}
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full border-0 text-[10px] uppercase tracking-wide',
                  job.status === 'SCHEDULED'
                    ? 'bg-cyan-500/10 text-cyan-500'
                    : 'bg-amber-500/10 text-amber-500',
                )}
              >
                {job.status.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
