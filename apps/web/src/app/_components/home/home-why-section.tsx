'use client';

import { Card, CardContent } from '@/components/ui/card';

const REASONS = [
  {
    icon: '🎯',
    title: 'Exterior-Focused',
    desc: 'Purpose-built for outdoor property services, not a generic marketplace.',
  },
  {
    icon: '🔒',
    title: 'Verified Providers',
    desc: 'Every provider is vetted before they can bid on jobs on our platform.',
  },
  {
    icon: '💰',
    title: 'Competitive Bidding',
    desc: 'Providers compete for your business. You pick the best price, rating, and fit.',
  },
  {
    icon: '📦',
    title: 'Subscription Plans',
    desc: 'Set up a plan and your recurring services happen automatically, every time.',
  },
  {
    icon: '🔄',
    title: 'Sticky Providers',
    desc: 'Once a provider accepts your recurring jobs, they stay assigned — no re-bidding.',
  },
  {
    icon: '💬',
    title: 'Instant Notifications',
    desc: 'SMS and in-app updates at every stage — new bids, scheduling, and completion.',
  },
] as const;

export function HomeWhySection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Why Exterior Pro
            </p>
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Built for exteriors — not generic leads.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Subscriptions plus competitive bidding, in one place — designed
              only for outdoor property work.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REASONS.map((item) => (
              <Card
                key={item.title}
                className="rounded-[1.35rem] border border-black/[0.06] bg-white/75 backdrop-blur-md transition-shadow hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03]"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-xl dark:from-white/10 dark:to-white/5">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
