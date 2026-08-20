import { cn } from '@/lib/utils';

const ROLE: Record<string, string> = {
  ADMIN: 'border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400',
  PROVIDER: 'border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400',
  CUSTOMER:
    'border-brand-lime/25 bg-brand-lime/10 text-brand-navy dark:text-brand-lime',
  CREW: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

const JOB: Record<string, string> = {
  OPEN: 'border-brand-lime/25 bg-brand-lime/10 text-brand-navy dark:text-brand-lime',
  PENDING: 'border-border bg-muted text-muted-foreground',
  SCHEDULED: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  IN_PROGRESS:
    'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  COMPLETED: 'border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400',
  CANCELLED: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
};

const PAYMENT: Record<string, string> = {
  SUCCEEDED: 'border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400',
  PENDING: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  FAILED: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
  REFUNDED: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  CANCELED: 'border-border bg-muted text-muted-foreground',
};

const TRANSFER: Record<string, string> = {
  PAID: 'border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400',
  PENDING: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  FAILED: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
  REVERSED: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

const MAPS = { role: ROLE, job: JOB, payment: PAYMENT, transfer: TRANSFER };

export function StatusBadge({
  value,
  kind = 'job',
  className,
}: {
  value: string | null | undefined;
  kind?: keyof typeof MAPS;
  className?: string;
}) {
  const label = value?.replaceAll('_', ' ') || 'NONE';
  const tone =
    MAPS[kind][value ?? ''] ?? 'border-border bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
