'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerDashboard() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trpc.quote.listForCustomer.query(),
      trpc.job.listForCustomer.query(),
    ])
      .then(([q, j]) => {
        setQuotes(q);
        setJobs(j);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) =>
    ['SCHEDULED', 'IN_PROGRESS'].includes(j.status),
  );
  const pendingQuotes = quotes.filter((q) => q.status === 'SENT');

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{pendingQuotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{activeJobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {jobs.filter((j) => j.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-6 text-left hover:border-cyan-300 dark:hover:border-cyan-700"
          onClick={() => router.push('/customer/services')}
        >
          <Wrench className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h3 className="font-semibold text-foreground">Browse Services</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Find and request quotes for exterior services
            </p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-6 text-left hover:border-cyan-300 dark:hover:border-cyan-700"
          onClick={() => router.push('/customer/properties')}
        >
          <MapPin className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h3 className="font-semibold text-foreground">Manage Properties</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add or update your property information
            </p>
          </div>
        </Button>
      </div>

      {activeJobs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Active Jobs
          </h3>
          <div className="space-y-3">
            {activeJobs.slice(0, 5).map((job) => (
              <Card key={job.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-foreground">
                      {job.quote.service.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.quote.property.address}, {job.quote.property.city}
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      job.status === 'SCHEDULED'
                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-0'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0'
                    )}
                  >
                    {job.status.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
