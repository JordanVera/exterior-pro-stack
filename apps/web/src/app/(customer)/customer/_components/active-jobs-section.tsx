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
  service: { name: string };
  property: { address: string };
}

interface ActiveJobsSectionProps {
  jobs: Job[];
}

export function ActiveJobsSection({ jobs }: ActiveJobsSectionProps) {
  const router = useRouter();

  if (jobs.length === 0) return null;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Active Jobs</h2>
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push('/customer/jobs')}
          className="p-0 h-auto text-xs text-cyan-500 hover:text-cyan-400"
        >
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {jobs.slice(0, 3).map((job) => (
          <Card
            key={job.id}
            className="shadow-none backdrop-blur-xl border-border bg-background/80"
          >
            <CardContent className="flex justify-between items-center p-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {job.service.name}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {job.property.address}
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
