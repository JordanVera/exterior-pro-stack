'use client';

import Link from 'next/link';
import { Plus, RotateCcw } from 'lucide-react';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { PropertyPhoto } from '@/components/property-photo';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { requestJobPath, type PropertySummary } from './utils';

export function PropertyCarousel({
  summaries,
}: {
  summaries: PropertySummary[];
}) {
  return (
    <SectionPanel
      title="My homes"
      count={summaries.length}
      viewAll={{ href: '/customer/settings', label: 'Manage' }}
      bare
    >
      <Carousel
        gutter="0px"
        controlsClassName="mt-2 max-w-none px-0"
        className="-mt-4"
        controlsSlot={
          <p className="text-xs text-muted-foreground">
            Drag to browse your properties.
          </p>
        }
      >
        {summaries.map(
          ({ property, activeJobsCount, openJobsCount, lastCompletedJob }) => (
            <CarouselItem key={property.id} className="w-[17.5rem]">
              <div className="relative flex h-full min-h-[13.5rem] flex-col overflow-hidden rounded-2xl border border-border bg-background/70 backdrop-blur-xl transition-colors hover:border-brand-lime/50">
                <GlowingEffect
                  disabled={false}
                  glow
                  proximity={72}
                  spread={28}
                  borderWidth={2}
                />

                <PropertyPhoto
                  src={property.imageUrl}
                  address={property.address}
                  className="relative h-28 shrink-0"
                />

                <div className="flex relative flex-col flex-1 px-5 pt-3 pb-5">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {property.address}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {property.city}, {property.state} {property.zip}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    {activeJobsCount > 0 ? (
                      <span className="rounded-full bg-brand-lime/10 px-2 py-0.5 font-semibold text-brand-navy dark:text-brand-lime">
                        {activeJobsCount} active
                      </span>
                    ) : null}
                    {openJobsCount > 0 ? (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                        {openJobsCount} open
                      </span>
                    ) : null}
                    {activeJobsCount === 0 && openJobsCount === 0 ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                        No active work
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-3 mt-auto border-t border-border">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs rounded-full"
                    >
                      <Link href={requestJobPath({ propertyId: property.id })}>
                        Request a job
                      </Link>
                    </Button>
                    {lastCompletedJob ? (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="w-full h-8 text-xs rounded-full text-brand-navy hover:bg-brand-lime/10 dark:text-brand-lime"
                      >
                        <Link
                          href={requestJobPath({
                            serviceId: lastCompletedJob.service.id,
                            propertyId: lastCompletedJob.property.id,
                          })}
                        >
                          <RotateCcw className="mr-1 w-3 h-3" />
                          Book {lastCompletedJob.serviceName} again
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ),
        )}

        <CarouselItem className="w-[17.5rem]">
          <Link
            href="/customer/settings"
            className="flex h-full min-h-[13.5rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 p-5 text-center transition-colors hover:border-brand-lime/50 hover:bg-brand-lime/5"
          >
            <span className="flex justify-center items-center w-10 h-10 rounded-xl border border-border bg-muted">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </span>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Add a property
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage more than one home from a single account.
            </p>
          </Link>
        </CarouselItem>
      </Carousel>
    </SectionPanel>
  );
}
