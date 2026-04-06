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
      <div className="px-6 mx-auto max-w-7xl">
        <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
              Why Exterior Pro
            </p>
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Not Just Another Marketplace.
              <br />
              <span className="text-muted-foreground">
                A Smarter Way to Manage Your Property.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Unlike generic platforms like Thumbtack or Angi, Exterior Pro
              combines subscription-based recurring services with a competitive
              bidding marketplace — built exclusively for exterior property work.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REASONS.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <div className="mb-2 text-2xl">{item.icon}</div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
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
