'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    title: 'Crew Management',
    desc: 'Organize teams, assign members, and dispatch crews to jobs with one click.',
  },
  {
    title: 'Smart Scheduling',
    desc: 'Calendar-based job scheduling with automatic conflict detection and reminders.',
  },
  {
    title: 'Bid & Win Jobs',
    desc: 'Browse open job requests in your area, submit competitive bids, and win new customers.',
  },
  {
    title: 'Recurring Revenue',
    desc: 'Get assigned to subscription customers and earn steady recurring income — no re-bidding needed.',
  },
] as const;

export function HomeProvidersSection() {
  const router = useRouter();

  return (
    <section id="providers" className="py-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="relative p-10 overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 sm:p-16">
          <div className="absolute top-0 right-0 -translate-y-1/2 rounded-full w-96 h-96 bg-green-500/20 blur-3xl translate-x-1/3" />
          <div className="relative grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-wider text-green-200 uppercase">
                For Service Providers
              </p>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Grow Your Business.
                <br />
                We&apos;ll Handle the Rest.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-green-100">
                Exterior Pro isn&apos;t just a lead generator. It&apos;s a full
                operations platform with crew management, job scheduling,
                competitive bidding, and recurring subscription jobs — all built
                for the way exterior service businesses actually work.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="text-lg text-green-700 bg-white shadow-lg hover:bg-green-50 shadow-green-900/30 rounded-xl"
                >
                  Start for Free
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {FEATURES.map((item, i) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white rounded-lg bg-white/20">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-green-100 mt-0.5">{item.desc}</p>
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
