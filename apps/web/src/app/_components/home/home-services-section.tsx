'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SERVICES = [
  {
    icon: '🌿',
    title: 'Lawn Maintenance',
    desc: 'Weekly or biweekly mowing, edging, trimming, fertilization, and weed control programs.',
    tag: 'Weekly / Biweekly',
    tagColor:
      'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400',
  },
  {
    icon: '🌳',
    title: 'Landscaping',
    desc: 'Full-service design, planting, mulching, hardscaping, and seasonal cleanup.',
    tag: 'Weekly / Biweekly',
    tagColor:
      'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400',
  },
  {
    icon: '🪴',
    title: 'Weed Control',
    desc: 'Targeted treatments, pre-emergent applications, and ongoing prevention programs.',
    tag: 'Monthly / Quarterly',
    tagColor:
      'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
  },
  {
    icon: '🏠',
    title: 'Gutter Cleaning',
    desc: 'Thorough gutter and downspout cleaning, guard installation, and debris removal.',
    tag: 'Quarterly / Biannual',
    tagColor:
      'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
  },
  {
    icon: '💧',
    title: 'Pressure Washing',
    desc: 'Driveways, siding, decks, patios, and fences restored to like-new condition.',
    tag: 'Most Popular',
    tagColor:
      'bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400',
  },
  {
    icon: '🎨',
    title: 'Exterior Painting',
    desc: 'Professional prep and painting for siding, trim, fences, decks, and more.',
    tag: 'One-Time',
    tagColor:
      'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400',
  },
  {
    icon: '✨',
    title: 'Window Cleaning',
    desc: 'Streak-free interior and exterior cleaning for homes and commercial properties.',
    tag: 'Biannual / One-Time',
    tagColor:
      'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
  },
  {
    icon: '🛠️',
    title: 'Roof Care',
    desc: 'Gentle roof soft washing, moss removal, and preventive maintenance.',
    tag: 'Biannual',
    tagColor:
      'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
  },
  {
    icon: '🌲',
    title: 'Tree & Shrub Care',
    desc: 'Pruning, trimming, health assessments, and removal for all property types.',
    tag: 'Seasonal / One-Time',
    tagColor:
      'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
  },
] as const;

export function HomeServicesSection() {
  const router = useRouter();

  return (
    <section id="services" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            All services
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Subscriptions &amp; one-time jobs
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Every service works on a plan or as a standalone request. Post what
            you need and let verified providers bid.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card
              key={service.title}
              className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-white/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/40 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-blue-500/25"
              onClick={() => router.push("/login")}
            >
              <CardContent className="p-6">
                {service.tag && (
                  <Badge
                    className={`absolute right-4 top-4 rounded-full border-0 text-xs font-medium ${service.tagColor}`}
                  >
                    {service.tag}
                  </Badge>
                )}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-3xl">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
                  Request service <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
