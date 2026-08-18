'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedTabs } from '@/components/ui/tabs';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { JobCard } from './job-card';
import { getPendingBids, type CustomerJob } from './job-status';

type FeedKey = 'attention' | 'upcoming' | 'completed';

const EMPTY: Record<
  FeedKey,
  { icon: typeof Bell; title: string; description: string }
> = {
  attention: {
    icon: Bell,
    title: "You're all caught up",
    description: 'Requests waiting on a decision from you will land here.',
  },
  upcoming: {
    icon: CalendarDays,
    title: 'No upcoming work',
    description: 'Scheduled and in-progress jobs will show up here.',
  },
  completed: {
    icon: CheckCircle2,
    title: 'Nothing finished yet',
    description: 'Once a crew wraps a job you can rebook it in one tap.',
  },
};

export function JobFeed({
  attention,
  upcoming,
  completed,
}: {
  attention: CustomerJob[];
  upcoming: CustomerJob[];
  completed: CustomerJob[];
}) {
  // Open with whichever list actually needs the customer.
  const [tab, setTab] = useState<FeedKey>(
    attention.length > 0 ? 'attention' : 'upcoming',
  );

  const lists: Record<FeedKey, CustomerJob[]> = {
    attention,
    upcoming,
    completed,
  };
  const jobs = lists[tab].slice(0, 5);
  const empty = EMPTY[tab];

  return (
    <SectionPanel
      title="Your jobs"
      count={lists[tab].length}
      viewAll={{ href: '/customer/jobs' }}
      bare
      headerSlot={
        <SegmentedTabs
          size="sm"
          layoutId="customer-job-feed"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'attention', label: 'Needs you' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
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
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background/70 backdrop-blur-xl">
              <EmptyState
                icon={empty.icon}
                title={empty.title}
                description={empty.description}
                action={
                  tab === 'attention' ? (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
                    >
                      <Link href="/customer/jobs/new">Request a service</Link>
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                cta={
                  tab === 'attention' && getPendingBids(job).length > 0
                    ? 'Review bids'
                    : undefined
                }
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </SectionPanel>
  );
}
