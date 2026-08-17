'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  label: string;
  sub: string;
  count: number;
  dot: string;
  href: string;
}

interface StatsSectionProps {
  openJobsCount: number;
  activeJobsCount: number;
  completedJobsCount: number;
  propertiesCount: number;
}

const STAT_ITEMS: Omit<StatItem, 'count'>[] = [
  { label: 'Open', sub: 'jobs', dot: 'bg-cyan-500', href: '/customer/jobs' },
  { label: 'Active', sub: 'jobs', dot: 'bg-blue-500', href: '/customer/jobs' },
  {
    label: 'Completed',
    sub: 'jobs',
    dot: 'bg-green-500',
    href: '/customer/jobs',
  },
  {
    label: 'Properties',
    sub: 'saved',
    dot: 'bg-muted-foreground',
    href: '/customer/settings',
  },
];

export function StatsSection({
  openJobsCount,
  activeJobsCount,
  completedJobsCount,
  propertiesCount,
}: StatsSectionProps) {
  const router = useRouter();
  const counts = [
    openJobsCount,
    activeJobsCount,
    completedJobsCount,
    propertiesCount,
  ];

  const stats: StatItem[] = STAT_ITEMS.map((item, i) => ({
    ...item,
    count: counts[i],
  }));

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="shadow-none backdrop-blur-xl transition-all cursor-pointer border-border bg-background/80 hover:border-cyan-500/50"
          onClick={() => router.push(s.href)}
        >
          <CardContent className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <div className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">{s.count}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
