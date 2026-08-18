export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatJobDate(
  date: string | Date,
  opts?: { weekday?: boolean },
) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: opts?.weekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
  });
}

export function formatJobDateTime(date: string | Date, time?: string | null) {
  const formatted = formatJobDate(date, { weekday: true });
  return time ? `${formatted} at ${time}` : formatted;
}

/** Stripe amounts are stored in cents; payout figures read better without them. */
export function formatCurrencyFromCents(cents: number, opts?: { compact?: boolean }) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts?.compact ? 0 : 2,
    maximumFractionDigits: opts?.compact ? 0 : 2,
  });
}

export function formatPrice(price: number | string, unit?: string) {
  const num = Number(price);
  const str = `$${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
  if (unit === 'SQFT') return `${str}/sq ft`;
  if (unit === 'HOUR') return `${str}/hr`;
  return str;
}

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
