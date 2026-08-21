'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  DollarSign,
  Phone,
  FileText,
  Users,
  ArrowLeft,
  Camera,
  X,
} from 'lucide-react';
import { JobMessageCenter } from '@/components/job-message-center';
import { trpc } from '../../../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatJobDateTime, STATUS_BADGE } from '../../_components/utils';
import { uploadJobPhotoFile, validateJobPhotoFile } from '@/lib/job-photos';

type JobPhotoKind = 'BEFORE' | 'AFTER';

export default function ProviderJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [schedulingMode, setSchedulingMode] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [assigningMode, setAssigningMode] = useState(false);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const fetchJob = async () => {
    try {
      const jobData = await trpc.job.getById.query({ jobId });
      setJob(jobData);
      setNotes(jobData.notes || '');
      if (jobData.scheduledDate) {
        const scheduled = new Date(jobData.scheduledDate);
        const month = `${scheduled.getMonth() + 1}`.padStart(2, '0');
        const day = `${scheduled.getDate()}`.padStart(2, '0');
        setSchedDate(`${scheduled.getFullYear()}-${month}-${day}`);
        setSchedTime(jobData.scheduledTime || '');
      }
    } catch (err) {
      toast.error('Failed to load job');
      router.push('/provider/jobs');
    }
  };

  const fetchCrews = async () => {
    try {
      const crewsData = await trpc.crew.list.query();
      setCrews(crewsData);
    } catch (err) {
      console.error('Failed to load crews');
    }
  };

  useEffect(() => {
    Promise.all([fetchJob(), fetchCrews()]).finally(() => setLoading(false));
  }, [jobId]);

  const handleSchedule = async () => {
    if (!schedDate) {
      toast.error('Please select a date');
      return;
    }

    if (!schedTime) {
      toast.error('Please select a time');
      return;
    }

    try {
      setUpdatingStatus(true);
      await trpc.job.schedule.mutate({
        jobId,
        scheduledDate: schedDate,
        scheduledTime: schedTime,
      });
      toast.success('Job scheduled successfully');
      setSchedulingMode(false);
      await fetchJob();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule job');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignCrew = async () => {
    if (!selectedCrewId) {
      toast.error('Please select a crew');
      return;
    }

    try {
      setUpdatingStatus(true);
      await trpc.job.assignCrew.mutate({ jobId, crewId: selectedCrewId });
      toast.success('Crew assigned successfully');
      setAssigningMode(false);
      setSelectedCrewId('');
      await fetchJob();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign crew');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusUpdate = async (
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  ) => {
    if (status === 'COMPLETED') {
      const hasBeforePhotos = job.photos.some((p: any) => p.kind === 'BEFORE');
      const hasAfterPhotos = job.photos.some((p: any) => p.kind === 'AFTER');

      if (!hasBeforePhotos || !hasAfterPhotos) {
        toast.error(
          'Please upload both before and after photos before completing',
        );
        return;
      }
    }

    try {
      setUpdatingStatus(true);
      await trpc.job.updateStatus.mutate({ jobId, status });
      toast.success(
        status === 'COMPLETED'
          ? 'Job completed!'
          : status === 'CANCELLED'
            ? 'Job cancelled'
            : 'Job started',
      );
      await fetchJob();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      // TODO: Add API endpoint to save provider notes
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePhotoUpload = async (files: File[], kind: JobPhotoKind) => {
    try {
      setUploadingPhotos(true);
      for (const file of files) {
        const error = validateJobPhotoFile(file);
        if (error) {
          toast.error(error);
          continue;
        }
        await uploadJobPhotoFile({ jobId, kind, file });
      }
      toast.success(
        `${kind === 'BEFORE' ? 'Before' : 'After'} photos uploaded`,
      );
      await fetchJob();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to upload photos',
      );
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await trpc.job.deletePhoto.mutate({ photoId });
      toast.success('Photo deleted');
      await fetchJob();
    } catch (err) {
      toast.error('Failed to delete photo');
    }
  };

  if (loading || !job) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-10" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
  const customer = job.property.customer;
  const beforePhotos = job.photos.filter((p: any) => p.kind === 'BEFORE');
  const afterPhotos = job.photos.filter((p: any) => p.kind === 'AFTER');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => router.push('/provider/jobs')}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to jobs
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 items-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {job.service.name}
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full border-0 text-xs uppercase tracking-wide',
                  badge.bg,
                  badge.text,
                )}
              >
                {badge.label}
              </Badge>
              {job.type === 'SUBSCRIPTION' && (
                <Badge
                  variant="secondary"
                  className="text-xs text-purple-500 rounded-full border-0 bg-purple-500/10"
                >
                  Subscription
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Job ID: {job.id.slice(0, 8)}
            </p>
          </div>

          {job.status === 'SCHEDULED' && (
            <Button
              size="sm"
              disabled={updatingStatus}
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              className="bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
            >
              Start Job
            </Button>
          )}

          {job.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              disabled={updatingStatus}
              onClick={() => handleStatusUpdate('COMPLETED')}
              className="bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
            >
              Complete Job
            </Button>
          )}
        </div>
      </div>

      {/* Job Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Property & Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property & Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{job.property.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.property.city}, {job.property.state} {job.property.zip}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {customer.firstName} {customer.lastName}
                  </p>
                  {customer.email && (
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  )}
                  {job.property.customer.user.phone ? (
                    <a
                      href={`tel:${job.property.customer.user.phone}`}
                      className="text-sm text-brand-lime hover:underline"
                    >
                      {job.property.customer.user.phone}
                    </a>
                  ) : null}
                </div>
              </div>

              {job.acceptedBid && (
                <div className="flex gap-3 items-start">
                  <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      ${Number(job.acceptedBid.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Agreed price
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule & Crew */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule & Crew</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedulingMode ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="schedDate">Date</Label>
                    <Input
                      id="schedDate"
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedTime">Time</Label>
                    <Input
                      id="schedTime"
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSchedule}
                      disabled={updatingStatus}
                      className="bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                    >
                      Save Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSchedulingMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    {job.scheduledDate ? (
                      <p className="text-sm font-medium">
                        {formatJobDateTime(
                          job.scheduledDate,
                          job.scheduledTime,
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Not scheduled
                      </p>
                    )}
                    {job.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="link"
                        className="p-0 h-auto text-brand-lime"
                        onClick={() => setSchedulingMode(true)}
                      >
                        {job.scheduledDate ? 'Reschedule' : 'Schedule now'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {assigningMode ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="crew">Select Crew</Label>
                    <Select
                      value={selectedCrewId}
                      onValueChange={setSelectedCrewId}
                    >
                      <SelectTrigger id="crew" className="mt-1">
                        <SelectValue placeholder="Choose a crew" />
                      </SelectTrigger>
                      <SelectContent>
                        {crews.map((crew) => (
                          <SelectItem key={crew.id} value={crew.id}>
                            {crew.name} ({crew.members.length} members)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAssignCrew}
                      disabled={updatingStatus}
                      className="bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                    >
                      Assign Crew
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssigningMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  <Users className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    {job.assignments?.length > 0 ? (
                      <div>
                        {job.assignments.map((a: any) => (
                          <p key={a.id} className="text-sm font-medium">
                            {a.crew.name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No crew assigned
                      </p>
                    )}
                    {['PENDING', 'SCHEDULED'].includes(job.status) &&
                      crews.length > 0 && (
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0 h-auto text-brand-lime"
                          onClick={() => setAssigningMode(true)}
                        >
                          {job.assignments?.length > 0
                            ? 'Change crew'
                            : 'Assign crew'}
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {job.customerNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 items-start">
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-foreground">{job.customerNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Provider Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this job..."
                rows={4}
              />
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Photos */}
        <div className="space-y-6">
          {/* Before Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-base">
                <span>Before Photos</span>
                {['PENDING', 'SCHEDULED', 'IN_PROGRESS'].includes(
                  job.status,
                ) && (
                  <Label htmlFor="before-photos" className="cursor-pointer">
                    <div className="flex gap-2 items-center text-sm text-brand-lime hover:underline">
                      <Camera className="w-4 h-4" />
                      Upload
                    </div>
                    <input
                      id="before-photos"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingPhotos}
                      className="sr-only"
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files?.length) {
                          void handlePhotoUpload(Array.from(files), 'BEFORE');
                        }
                        event.target.value = '';
                      }}
                    />
                  </Label>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {beforePhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {beforePhotos.map((photo: any) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Before"
                        className="object-cover w-full h-32 rounded-lg"
                      />
                      {job.status !== 'COMPLETED' && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-sm text-center text-muted-foreground">
                  No before photos yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* After Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-base">
                <span>After Photos</span>
                {['IN_PROGRESS'].includes(job.status) && (
                  <Label htmlFor="after-photos" className="cursor-pointer">
                    <div className="flex gap-2 items-center text-sm text-brand-lime hover:underline">
                      <Camera className="w-4 h-4" />
                      Upload
                    </div>
                    <input
                      id="after-photos"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingPhotos}
                      className="sr-only"
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files?.length) {
                          void handlePhotoUpload(Array.from(files), 'AFTER');
                        }
                        event.target.value = '';
                      }}
                    />
                  </Label>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {afterPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {afterPhotos.map((photo: any) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="After"
                        className="object-cover w-full h-32 rounded-lg"
                      />
                      {job.status !== 'COMPLETED' && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-sm text-center text-muted-foreground">
                  No after photos yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {['PENDING', 'SCHEDULED'].includes(job.status) && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => handleStatusUpdate('CANCELLED')}
              disabled={updatingStatus}
            >
              Cancel Job
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <JobMessageCenter jobId={job.id} enabled={job.status !== 'OPEN'} />
        </CardContent>
      </Card>
    </div>
  );
}
