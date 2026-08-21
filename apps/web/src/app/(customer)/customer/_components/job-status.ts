export type CustomerJob = {
  id: string;
  propertyId: string;
  status: string;
  type?: string;
  customerNotes?: string | null;
  scheduledDate?: string | Date | null;
  scheduledTime?: string | null;
  completedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  service: {
    id: string;
    name: string;
    description?: string | null;
    category?: { id: string; name: string } | null;
  };
  acceptedBid?: {
    id: string;
    price: unknown;
    notes?: string | null;
    provider: {
      id: string;
      businessName: string;
      verified?: boolean;
      description?: string | null;
      logoUrl?: string | null;
      rating?: { average: number | null; count: number };
    };
  } | null;
  bids?: {
    id: string;
    price: unknown;
    notes?: string | null;
    status: string;
    provider: {
      id: string;
      businessName: string;
      verified?: boolean;
      description?: string | null;
      logoUrl?: string | null;
      rating?: { average: number | null; count: number };
    };
  }[];
  assignments?: { crew: { name: string } }[];
  recurringSchedule?: {
    active: boolean;
    frequency: string;
    nextDate: string | Date;
  } | null;
  payments?: {
    status: string;
    amountCents: number;
    kind: string;
  }[];
  photos?: {
    id: string;
    url: string;
    kind: 'BEFORE' | 'AFTER' | string;
  }[];
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string | Date;
  } | null;
};

export const STATUS_DOT: Record<string, string> = {
  OPEN: 'bg-brand-lime',
  PENDING: 'bg-muted-foreground',
  SCHEDULED: 'bg-blue-500',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};

export const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  OPEN: {
    bg: 'bg-brand-lime/10',
    text: 'text-brand-navy dark:text-brand-lime',
    label: 'Open',
  },
  PENDING: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    label: 'Pending',
  },
  SCHEDULED: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    label: 'Scheduled',
  },
  IN_PROGRESS: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    label: 'In progress',
  },
  COMPLETED: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    label: 'Completed',
  },
  CANCELLED: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    label: 'Cancelled',
  },
};

export function getPendingBids(job: CustomerJob) {
  return job.bids?.filter((bid) => bid.status === 'PENDING') ?? [];
}

export function getSucceededTip(job: CustomerJob) {
  return job.payments?.find(
    (payment) => payment.kind === 'TIP' && payment.status === 'SUCCEEDED',
  );
}

export function getJobPayment(job: CustomerJob) {
  return job.payments?.find(
    (payment) =>
      payment.status === 'SUCCEEDED' &&
      (payment.kind === 'JOB' || payment.kind === 'SUBSCRIPTION'),
  );
}

export function formatJobDate(
  date: string | Date,
  opts?: { weekday?: boolean; year?: boolean },
) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: opts?.weekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: opts?.year ? 'numeric' : undefined,
  });
}

export function formatJobDateTime(date: string | Date, time?: string | null) {
  const formatted = formatJobDate(date, { weekday: true });
  return time ? `${formatted} at ${time}` : formatted;
}

export function getJobNextAction(job: CustomerJob): string {
  const pending = getPendingBids(job).length;

  switch (job.status) {
    case 'OPEN':
      return pending > 0
        ? `${pending} bid${pending === 1 ? '' : 's'} to review`
        : 'Waiting for bids';
    case 'PENDING':
      return 'Waiting for provider to schedule';
    case 'SCHEDULED':
      return job.scheduledDate
        ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
        : 'Scheduled';
    case 'IN_PROGRESS':
      return 'In progress';
    case 'COMPLETED':
      if (!job.review) return 'Leave a review';
      if (!getSucceededTip(job)) return 'Add a tip';
      return job.completedAt
        ? `Completed ${formatJobDate(job.completedAt)}`
        : 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return '';
  }
}

export function getJobCta(job: CustomerJob): string {
  if (job.status === 'OPEN' && getPendingBids(job).length > 0) {
    return 'Review bids';
  }
  if (job.status === 'OPEN') return 'View request';
  if (job.status === 'COMPLETED') {
    if (!job.review) return 'Leave a review';
    if (!getSucceededTip(job)) return 'Add a tip';
    return 'Book again';
  }
  return 'View job';
}
