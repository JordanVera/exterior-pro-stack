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
  { label: 'Completed', sub: 'jobs', dot: 'bg-green-500', href: '/customer/jobs' },
  { label: 'Properties', sub: 'saved', dot: 'bg-neutral-400', href: '/customer/settings' },
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
          className="transition-all shadow-none cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700"
          onClick={() => router.push(s.href)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
              <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                {s.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {s.count}
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-600">
              {s.sub}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
