'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Users } from 'lucide-react';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatJobDate } from './utils';

export type OpenJob = {
  id: string;
  createdAt: string | Date;
  customerNotes?: string | null;
  service: { name: string; category?: { name: string } | null };
  property: { address: string; city: string; state: string; zip: string };
  bids?: { id: string }[];
};

export function OpenJobsCarousel({ jobs }: { jobs: OpenJob[] }) {
  if (jobs.length === 0) {
    return (
      <SectionPanel title="Open jobs near you" bodyClassName="p-0">
        <EmptyState
          icon={MapPin}
          title="No open jobs right now"
          description="New requests matching your services and ZIP codes will appear here."
        />
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Open jobs near you"
      count={jobs.length}
      viewAll={{ href: '/provider/quotes', label: 'Browse all' }}
      bare
    >
      <Carousel
        gutter="0px"
        controlsClassName="mt-2 max-w-none px-0"
        className="-mt-4"
        controlsSlot={
          <p className="text-xs text-muted-foreground">
            Requests in your service area you have not bid on yet.
          </p>
        }
      >
        {jobs.slice(0, 12).map((job) => {
          const bidCount = job.bids?.length ?? 0;
          return (
            <CarouselItem key={job.id} className="w-[19rem]">
              <Link href="/provider/quotes" className="block h-full group">
                <div className="relative flex h-full min-h-[13.5rem] flex-col overflow-hidden rounded-2xl border border-border bg-background/70 p-5 backdrop-blur-xl transition-colors hover:border-brand-lime/50">
                  <GlowingEffect
                    disabled={false}
                    glow
                    proximity={72}
                    spread={28}
                    borderWidth={2}
                  />

                  <div className="flex relative flex-col flex-1">
                    <div className="flex gap-2 justify-between items-center">
                      {job.service.category?.name ? (
                        <span className="rounded-full border border-brand-lime/25 bg-brand-lime/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-navy dark:text-brand-lime">
                          {job.service.category.name}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {formatJobDate(job.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold truncate text-foreground">
                      {job.service.name}
                    </p>
                    <p className="flex gap-1 items-center mt-1 text-xs truncate text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {job.property.city}, {job.property.state}{' '}
                      {job.property.zip}
                    </p>

                    {job.customerNotes ? (
                      <p className="mt-3 text-xs leading-relaxed line-clamp-2 text-muted-foreground">
                        {job.customerNotes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex relative gap-2 justify-between items-center pt-3 mt-4 border-t border-border">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {bidCount === 0
                        ? 'No bids yet'
                        : `${bidCount} bid${bidCount === 1 ? '' : 's'} placed`}
                    </span>
                    <span className="inline-flex gap-1 items-center text-xs font-semibold text-brand-navy dark:text-brand-lime">
                      Place a bid
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          );
        })}
      </Carousel>
    </SectionPanel>
  );
}
