'use client';

import { useRouter } from 'next/navigation';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { PROVIDER_FEATURES } from './data';

export function ProvidersSection() {
  const router = useRouter();

  return (
    <section id="providers" className="py-24 scroll-mt-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="overflow-hidden relative px-8 py-16 rounded-3xl border border-white/10 bg-neutral-950 sm:px-16">
          <BackgroundBeams className="opacity-60" />
          <div className="grid relative gap-12 items-center lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-400">
                For service providers
              </p>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
                Grow your business.
                <br />
                We&apos;ll handle the rest.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-neutral-300">
                Exterior Pro isn&apos;t just a lead generator. It&apos;s a
                full operations platform with crew management, job
                scheduling, competitive bidding, and recurring subscription
                jobs — all built for the way exterior service businesses
                actually work.
              </p>
              <div className="mt-8">
                <HoverBorderGradient
                  as="button"
                  containerClassName="rounded-full"
                  className="px-8 py-3 text-sm font-medium"
                  onClick={() => router.push('/login')}
                >
                  Start for free
                </HoverBorderGradient>
              </div>
            </div>
            <div className="space-y-3">
              {PROVIDER_FEATURES.map((item, index) => (
                <div
                  key={item.title}
                  className="flex gap-4 items-start p-4 rounded-2xl border backdrop-blur-sm border-white/10 bg-white/5"
                >
                  <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-cyan-300 rounded-lg shrink-0 bg-cyan-500/20">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="mt-0.5 text-sm text-neutral-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
