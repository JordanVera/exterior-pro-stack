'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarClock, CalendarDays, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedTabs } from '@/components/ui/tabs';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ProviderJobCard } from './provider-job-card';
import { STATUS_BADGE, formatJobDateTime, formatPrice } from './utils';

type FeedKey = 'schedule' | 'upcoming' | 'bids';

type ProviderJob = {
  id: string;
  scheduledDate?: string | Date | null;
  scheduledTime?: string | null;
  service: { name: string };
  property: { address: string; city: string };
  assignments?: { crew: { name: string } }[];
};

type ProviderBid = {
  id: string;
  price: unknown;
  createdAt: string | Date;
  job: {
    id: string;
    service: { name: string };
    property: { address: string; city: string };
  };
};

const EMPTY: Record<
  FeedKey,
  { icon: typeof CalendarClock; title: string; description: string }
> = {
  schedule: {
    icon: CalendarClock,
    title: "You're all caught up",
    description: 'Jobs you win that still need a date will land here.',
  },
  upcoming: {
    icon: CalendarDays,
    title: 'Nothing booked this week',
    description: 'Scheduled work for the next 7 days shows up here.',
  },
  bids: {
    icon: Gavel,
    title: 'No bids out',
    description: 'Bid on open jobs to get work on the calendar.',
  },
};

export function ProviderJobFeed({
  needsScheduling,
  upcoming,
  pendingBids,
}: {
  needsScheduling: ProviderJob[];
  upcoming: ProviderJob[];
  pendingBids: ProviderBid[];
}) {
  const [tab, setTab] = useState<FeedKey>(
    needsScheduling.length > 0 ? 'schedule' : 'upcoming',
  );

  const counts: Record<FeedKey, number> = {
    schedule: needsScheduling.length,
    upcoming: upcoming.length,
    bids: pendingBids.length,
  };
  const empty = EMPTY[tab];

  return (
    <SectionPanel
      title="Your work"
      count={counts[tab]}
      viewAll={{ href: tab === 'bids' ? '/provider/quotes' : '/provider/jobs' }}
      bare
      headerSlot={
        <SegmentedTabs
          size="sm"
          layoutId="provider-job-feed"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'schedule', label: 'To schedule' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'bids', label: 'Bids out' },
          ]}
        />
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-2"
        >
          {counts[tab] === 0 ? (
            <div className="rounded-2xl border border-border bg-background/70 backdrop-blur-xl">
              <EmptyState
                icon={empty.icon}
                title={empty.title}
                description={empty.description}
                action={
                  tab === 'bids' ? (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
                    >
                      <Link href="/provider/quotes">Browse open jobs</Link>
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : tab === 'schedule' ? (
            needsScheduling.slice(0, 5).map((job) => (
              <ProviderJobCard
                key={job.id}
                href="/provider/jobs"
                title={job.service.name}
                subtitle={`${job.property.address}, ${job.property.city}`}
                badge={{
                  label: 'Schedule',
                  bg: STATUS_BADGE.PENDING.bg,
                  text: STATUS_BADGE.PENDING.text,
                }}
                dotClassName="bg-amber-500"
              />
            ))
          ) : tab === 'upcoming' ? (
            upcoming.slice(0, 5).map((job) => {
              const crews = job.assignments?.length
                ? job.assignments.map((a) => a.crew.name).join(', ')
                : null;
              return (
                <ProviderJobCard
                  key={job.id}
                  href="/provider/jobs"
                  title={job.service.name}
                  subtitle={`${job.property.address}, ${job.property.city}${crews ? ` · ${crews}` : ''}`}
                  meta={
                    job.scheduledDate
                      ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
                      : 'Not scheduled'
                  }
                  dotClassName="bg-blue-500"
                />
              );
            })
          ) : (
            pendingBids.slice(0, 5).map((bid) => (
              <ProviderJobCard
                key={bid.id}
                href="/provider/quotes"
                title={bid.job.service.name}
                subtitle={`${bid.job.property.address}, ${bid.job.property.city}`}
                meta={formatPrice(bid.price as number)}
                badge={{
                  label: 'Awaiting',
                  bg: STATUS_BADGE.OPEN.bg,
                  text: STATUS_BADGE.OPEN.text,
                }}
                dotClassName="bg-brand-lime"
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </SectionPanel>
  );
}
