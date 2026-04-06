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
    <section id="services" className="py-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
            All Services
          </p>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Subscriptions &amp; One-Time Jobs
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
            Every service is available as part of a subscription plan or as a
            standalone job request. Post what you need and let verified providers
            bid for your business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card
              key={service.title}
              className="relative transition-all cursor-pointer group hover:border-cyan-200 dark:hover:border-cyan-900 hover:shadow-lg dark:hover:shadow-cyan-950/20 rounded-2xl"
              onClick={() => router.push('/login')}
            >
              <CardContent className="p-6">
                {service.tag && (
                  <Badge
                    className={`absolute border-0 top-4 right-4 ${service.tagColor}`}
                  >
                    {service.tag}
                  </Badge>
                )}
                <div className="mb-4 text-4xl">{service.icon}</div>
                <h3 className="text-lg font-semibold transition-colors text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                  {service.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {service.desc}
                </p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium transition-opacity opacity-0 text-cyan-600 dark:text-cyan-400 group-hover:opacity-100">
                  Request service <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
