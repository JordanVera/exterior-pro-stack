'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';
import { trpc } from '../../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatJobDateTime, STATUS_BADGE } from '../_components/utils';
import {
  JobPhotoGallery,
  jobHasBeforeAndAfter,
} from '@/components/job-photo-gallery';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'Active' },
  { value: 'COMPLETED', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ProviderJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [schedulingJobId, setSchedulingJobId] = useState<string | null>(null);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState('');

  const fetchData = () => {
    const params = filter ? { status: filter as any } : undefined;
    Promise.all([
      trpc.job.listForProvider.query(params),
      trpc.crew.list.query(),
    ])
      .then(([j, c]) => {
        setJobs(j);
        setCrews(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [filter]);

  const handleSchedule = async (jobId: string) => {
    if (!schedDate || !schedTime) return;
    try {
      await trpc.job.schedule.mutate({
        jobId,
        scheduledDate: schedDate,
        scheduledTime: schedTime,
      });
      toast.success('Job scheduled');
      setSchedulingJobId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule');
    }
  };

  const handleAssignCrew = async (jobId: string) => {
    if (!selectedCrewId) return;
    try {
      await trpc.job.assignCrew.mutate({ jobId, crewId: selectedCrewId });
      toast.success('Crew assigned');
      setAssigningJobId(null);
      setSelectedCrewId('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign crew');
    }
  };

  const handleStatusUpdate = async (
    jobId: string,
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  ) => {
    try {
      await trpc.job.updateStatus.mutate({ jobId, status });
      toast.success(
        `Job ${status === 'COMPLETED' ? 'completed' : status === 'CANCELLED' ? 'cancelled' : 'started'}`,
      );
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-full h-10 rounded-full" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My jobs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schedule, assign crews, and manage accepted jobs.
        </p>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {FILTERS.map((item) => (
          <Badge
            key={item.value}
            variant="secondary"
            onClick={() => setFilter(item.value)}
            className={cn(
              'cursor-pointer select-none rounded-full border-0 px-3.5 py-1.5 text-xs font-medium',
              filter === item.value
                ? 'bg-brand-lime text-brand-ink hover:bg-brand-lime'
                : 'hover:text-foreground',
            )}
          >
            {item.label}
          </Badge>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-14 h-14 rounded-full bg-muted">
            <ClipboardList className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">
            No jobs yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Win bids on available jobs to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
            const photosReady = jobHasBeforeAndAfter(job.photos);
            return (
              <Card
                key={job.id}
                className="shadow-none backdrop-blur-xl border-border bg-background/80 cursor-pointer transition-all hover:shadow-md"
                onClick={() => router.push(`/provider/jobs/${job.id}`)}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex gap-3 justify-between items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        <h3 className="text-sm font-semibold text-foreground">
                          {job.service.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'rounded-full border-0 text-[10px] uppercase tracking-wide',
                            badge.bg,
                            badge.text,
                          )}
                        >
                          {badge.label}
                        </Badge>
                        {job.type === 'SUBSCRIPTION' && (
                          <Badge
                            variant="secondary"
                            className="rounded-full border-0 bg-purple-500/10 text-[10px] text-purple-500"
                          >
                            Sub
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.property.address}, {job.property.city}
                      </p>
                      {job.acceptedBid && (
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          ${Number(job.acceptedBid.price).toFixed(2)}
                        </p>
                      )}
                      {job.customerNotes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Notes: {job.customerNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-right text-muted-foreground">
                      {job.scheduledDate && (
                        <div>
                          {formatJobDateTime(
                            job.scheduledDate,
                            job.scheduledTime,
                          )}
                        </div>
                      )}
                      {job.assignments?.length > 0 && (
                        <div>
                          {job.assignments
                            .map((a: any) => a.crew.name)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <JobPhotoGallery photos={job.photos} />

                  <div className="flex flex-wrap gap-2">
                    {job.status === 'PENDING' &&
                      (schedulingJobId === job.id ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <Input
                            type="date"
                            value={schedDate}
                            onChange={(e) => setSchedDate(e.target.value)}
                            className="w-auto h-8"
                          />
                          <Input
                            type="time"
                            value={schedTime}
                            onChange={(e) => setSchedTime(e.target.value)}
                            className="w-auto h-8"
                          />
                          <Button
                            size="sm"
                            className="h-8 rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                            onClick={() => handleSchedule(job.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => setSchedulingJobId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                          onClick={() => setSchedulingJobId(job.id)}
                        >
                          Schedule
                        </Button>
                      ))}

                    {['PENDING', 'SCHEDULED'].includes(job.status) &&
                      crews.length > 0 &&
                      (assigningJobId === job.id ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <Select
                            value={selectedCrewId}
                            onValueChange={setSelectedCrewId}
                          >
                            <SelectTrigger className="w-48 h-8">
                              <SelectValue placeholder="Select crew" />
                            </SelectTrigger>
                            <SelectContent>
                              {crews.map((crew) => (
                                <SelectItem key={crew.id} value={crew.id}>
                                  {crew.name} ({crew.members.length})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            className="h-8 rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                            onClick={() => handleAssignCrew(job.id)}
                          >
                            Assign
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => setAssigningJobId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={() => setAssigningJobId(job.id)}
                        >
                          Assign crew
                        </Button>
                      ))}

                    {job.status === 'SCHEDULED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={() =>
                          handleStatusUpdate(job.id, 'IN_PROGRESS')
                        }
                      >
                        Start job
                      </Button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          disabled={!photosReady}
                          className="h-8 rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90 disabled:opacity-50"
                          onClick={() =>
                            handleStatusUpdate(job.id, 'COMPLETED')
                          }
                        >
                          Complete job
                        </Button>
                        {!photosReady ? (
                          <p className="text-xs text-muted-foreground">
                            Add before and after photos to complete
                          </p>
                        ) : null}
                      </div>
                    )}

                    {['PENDING', 'SCHEDULED'].includes(job.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-red-500 rounded-full hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => handleStatusUpdate(job.id, 'CANCELLED')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
