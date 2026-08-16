'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Check,
  Repeat,
  Scale,
  Shield,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { LandingNavbar } from './navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Spotlight } from '@/components/ui/spotlight';
import { FlipWords } from '@/components/ui/flip-words';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { Timeline } from '@/components/ui/timeline';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Basic Lawn Care',
    price: 99,
    period: '/mo',
    desc: 'Essential lawn care with bi-weekly mowing and monthly weed control.',
    features: [
      'Bi-weekly lawn mowing',
      'Monthly weed control',
      'Matched local provider',
      'Pause or cancel anytime',
    ],
    highlight: false,
  },
  {
    name: 'Standard Exterior',
    price: 179,
    period: '/mo',
    desc: 'Weekly mowing, weed control, and quarterly gutter cleaning.',
    features: [
      'Weekly lawn mowing',
      'Monthly weed control',
      'Quarterly gutter cleaning',
      'Dedicated provider assignment',
    ],
    highlight: true,
  },
  {
    name: 'Premium Exterior',
    price: 299,
    period: '/mo',
    desc: 'The full package for complete exterior upkeep.',
    features: [
      'Weekly lawn mowing',
      'Bi-weekly weed control',
      'Quarterly gutter cleaning',
      'Bi-annual pressure washing',
      'Quarterly window cleaning',
    ],
    highlight: false,
  },
];

const SERVICES = [
  {
    title: 'Lawn Maintenance',
    description:
      'Weekly or biweekly mowing, edging, trimming, fertilization, and weed control programs.',
    link: '/login',
    tag: 'Weekly / Biweekly',
  },
  {
    title: 'Landscaping',
    description:
      'Full-service design, planting, mulching, hardscaping, and seasonal cleanup.',
    link: '/login',
    tag: 'Weekly / Biweekly',
  },
  {
    title: 'Weed Control',
    description:
      'Targeted treatments, pre-emergent applications, and ongoing prevention programs.',
    link: '/login',
    tag: 'Monthly / Quarterly',
  },
  {
    title: 'Gutter Cleaning',
    description:
      'Thorough gutter and downspout cleaning, guard installation, and debris removal.',
    link: '/login',
    tag: 'Quarterly / Biannual',
  },
  {
    title: 'Pressure Washing',
    description:
      'Driveways, siding, decks, patios, and fences restored to like-new condition.',
    link: '/login',
    tag: 'Most popular',
  },
  {
    title: 'Exterior Painting',
    description:
      'Professional prep and painting for siding, trim, fences, decks, and more.',
    link: '/login',
    tag: 'One-time',
  },
  {
    title: 'Window Cleaning',
    description:
      'Streak-free interior and exterior cleaning for homes and commercial properties.',
    link: '/login',
    tag: 'Biannual / One-time',
  },
  {
    title: 'Roof Care',
    description:
      'Gentle roof soft washing, moss removal, and preventive maintenance.',
    link: '/login',
    tag: 'Biannual',
  },
  {
    title: 'Tree & Shrub Care',
    description:
      'Pruning, trimming, health assessments, and removal for all property types.',
    link: '/login',
    tag: 'Seasonal / One-time',
  },
];

const CAPABILITY_CARDS = [
  {
    quote:
      'Subscribe once. Mowing, weed control, and gutters run on a calendar — not a to-do list.',
    name: 'Subscription plans',
    title: 'Recurring exterior care',
  },
  {
    quote:
      'Post a one-time job and let verified local providers compete on price, timing, and fit.',
    name: 'On-demand marketplace',
    title: 'Competitive bidding',
  },
  {
    quote:
      'Once a provider is assigned to a recurring plan, they stay on it. No re-bidding every visit.',
    name: 'Sticky providers',
    title: 'Dedicated crews',
  },
  {
    quote:
      'Track progress in real time with SMS and in-app updates from bid to completion.',
    name: 'Live operations',
    title: 'Job tracking',
  },
  {
    quote:
      'Built only for exterior work — lawn, landscape, gutters, wash, paint, and roof care.',
    name: 'Specialized platform',
    title: 'Not a generic marketplace',
  },
];

const FAQS = [
  {
    q: 'What is the difference between a plan and a one-time job?',
    a: 'Plans are recurring subscriptions — your provider shows up on a set cadence so lawn care, weed control, and seasonal work happen automatically. One-time jobs are posted to the marketplace, where verified providers submit bids you can compare and accept.',
  },
  {
    q: 'Can I pause or cancel a subscription?',
    a: 'Yes. Plans can be paused or canceled at any time from your account. You are not locked into a long-term contract.',
  },
  {
    q: 'Are providers verified?',
    a: 'Every provider is vetted before they can bid or take subscription work on Exterior Pro. You see ratings, notes, and availability before you accept.',
  },
  {
    q: 'How does bidding work?',
    a: 'You post a job with property details. Local providers submit competitive bids with pricing and timing. Compare side by side and accept the best fit in one click.',
  },
  {
    q: 'Is Exterior Pro only for homeowners?',
    a: 'No. Homeowners, property managers, and exterior service businesses all use the platform — customers for plans and jobs, providers for crews, scheduling, and recurring revenue.',
  },
];

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
      <span className="w-6 h-px bg-cyan-500" />
      {children}
    </p>
  );
}

function BentoVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex-1 w-full overflow-hidden rounded-xl min-h-[6rem]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 40vw"
        className="object-cover transition duration-500 group-hover/bento:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/50 via-black/10" />
    </div>
  );
}

function PlanCard({
  plan,
  onStart,
}: {
  plan: (typeof PLANS)[number];
  onStart: () => void;
}) {
  const inner = (
    <div className="relative p-2 h-full rounded-2xl border border-border bg-background">
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div className="flex relative flex-col p-6 h-full rounded-xl md:p-8">
        {plan.highlight ? (
          <Badge className="mb-4 text-cyan-700 border-0 w-fit bg-cyan-500/15 dark:text-cyan-300">
            Most popular
          </Badge>
        ) : (
          <div className="mb-4 h-6" />
        )}
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        <div className="flex gap-1 items-baseline mt-3">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            ${plan.price}
          </span>
          <span className="text-muted-foreground">{plan.period}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{plan.desc}</p>
        <ul className="flex-1 mt-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 items-start text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={onStart}
          className={cn(
            'mt-8 w-full rounded-xl',
            plan.highlight && 'bg-cyan-500 text-black hover:bg-cyan-400',
          )}
          variant={plan.highlight ? 'default' : 'outline'}
        >
          Get started
        </Button>
      </div>
    </div>
  );

  if (!plan.highlight) return inner;

  return (
    <BackgroundGradient
      containerClassName="rounded-3xl h-full"
      className="h-full rounded-3xl"
    >
      {inner}
    </BackgroundGradient>
  );
}

export function LandingPage() {
  const router = useRouter();
  const goLogin = () => router.push('/login');

  const timeline = [
    {
      title: '01',
      content: (
        <div className="p-6 rounded-2xl border backdrop-blur-sm border-border bg-card/60">
          <h4 className="text-xl font-semibold text-foreground">
            Choose a plan or post a job
          </h4>
          <p className="mt-3 text-muted-foreground">
            Subscribe to recurring services or post a one-time job with your
            property details. It takes less than two minutes.
          </p>
        </div>
      ),
    },
    {
      title: '02',
      content: (
        <div className="p-6 rounded-2xl border backdrop-blur-sm border-border bg-card/60">
          <h4 className="text-xl font-semibold text-foreground">
            Providers bid
          </h4>
          <p className="mt-3 text-muted-foreground">
            Verified local providers in your area see the job and submit
            competitive bids with pricing and availability.
          </p>
        </div>
      ),
    },
    {
      title: '03',
      content: (
        <div className="p-6 rounded-2xl border backdrop-blur-sm border-border bg-card/60">
          <h4 className="text-xl font-semibold text-foreground">
            Pick your pro
          </h4>
          <p className="mt-3 text-muted-foreground">
            Compare bids side by side — pricing, provider ratings, and notes.
            Accept the best fit with one click.
          </p>
        </div>
      ),
    },
    {
      title: '04',
      content: (
        <div className="p-6 rounded-2xl border backdrop-blur-sm border-border bg-card/60">
          <h4 className="text-xl font-semibold text-foreground">
            Sit back and relax
          </h4>
          <p className="mt-3 text-muted-foreground">
            Your provider handles everything. Track progress in real time and
            get notified when work is complete.
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <LandingNavbar />
      <div className="overflow-x-hidden relative min-h-screen bg-background text-foreground">
        <section className="relative min-h-[90vh] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover absolute inset-0 w-full h-full"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background/75 dark:bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background dark:from-black dark:via-black/40 dark:to-black" />
          <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <Spotlight
            className="left-0 -top-40 md:-top-20 md:left-60"
            fill="#02ddf5"
          />

          <div className="flex relative flex-col items-center px-6 pt-24 pb-24 mx-auto max-w-5xl text-center sm:pt-32">
            <Badge className="gap-2 mb-6 text-cyan-700 border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/10 dark:text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Subscriptions and on-demand services
            </Badge>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Your property&apos;s exterior
              <br />
              <span className="relative inline-block min-h-[1.15em]">
                <FlipWords
                  words={['on autopilot.', 'on schedule.', 'handled.']}
                  className="px-0 text-cyan-500 dark:text-cyan-400"
                />
              </span>
            </h1>

            <TextGenerateEffect
              words="Subscribe to recurring lawn care, landscaping, gutter cleaning, and more. Need a one-time job? Post a request and let verified local pros compete with their best bids."
              className="mx-auto mt-6 max-w-2xl text-base font-normal sm:text-lg"
              duration={0.35}
            />

            <div className="flex flex-col gap-4 justify-center items-center mt-10 sm:flex-row">
              <MovingBorderButton
                borderRadius="0.85rem"
                duration={2500}
                type="button"
                containerClassName="h-14 w-52"
                className="text-sm font-semibold text-white border-slate-800/60 bg-slate-950/80"
                onClick={goLogin}
              >
                Browse plans
              </MovingBorderButton>
              <HoverBorderGradient
                as="button"
                containerClassName="rounded-full"
                className="px-8 py-3 text-sm font-medium dark:bg-black"
                onClick={goLogin}
              >
                Join as a provider
              </HoverBorderGradient>
            </div>

            <div className="flex flex-wrap gap-y-3 gap-x-6 justify-center items-center mt-12 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-cyan-500" /> Recurring plans
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" /> Verified
                providers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-500" /> Real-time
                tracking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" /> Competitive
                bidding
              </span>
            </div>
          </div>
        </section>

        <section className="relative py-12">
          <InfiniteMovingCards
            items={CAPABILITY_CARDS}
            direction="left"
            speed="slow"
            className="max-w-full"
          />
        </section>

        <section id="plans" className="py-24 scroll-mt-24">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <SectionEyebrow>Subscription plans</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Set it and forget it
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Choose a plan that fits your property. Recurring services are
                handled automatically — your dedicated provider shows up on
                schedule so you never have to think about it.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 items-stretch md:grid-cols-3">
              {PLANS.map((plan) => (
                <PlanCard key={plan.name} plan={plan} onStart={goLogin} />
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="py-24 scroll-mt-24">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="mb-4 text-center">
              <SectionEyebrow>All services</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Subscriptions and one-time jobs
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every service is available as part of a subscription plan or as
                a standalone job request. Post what you need and let verified
                providers bid for your business.
              </p>
            </div>
            <HoverEffect items={SERVICES} />
          </div>
        </section>

        <section id="how-it-works" className="py-8 scroll-mt-24 md:py-16">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="mb-4 text-center md:mb-0 md:text-left">
              <SectionEyebrow>Simple process</SectionEyebrow>
            </div>
          </div>
          <Timeline
            data={timeline}
            title="Booked in minutes, done right"
            description="Whether you subscribe to a plan or post a one-time job, getting work done is fast and transparent."
          />
        </section>

        <section className="py-24">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="mb-16 max-w-3xl">
              <SectionEyebrow>Why Exterior Pro</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Not just another marketplace.
                <span className="block mt-2 text-muted-foreground">
                  A smarter way to manage your property.
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Unlike generic platforms like Thumbtack or Angi, Exterior Pro
                combines subscription-based recurring services with a
                competitive bidding marketplace — built exclusively for exterior
                property work.
              </p>
            </div>

            <BentoGrid className="max-w-none md:auto-rows-[20rem]">
              <BentoGridItem
                className="md:col-span-2"
                title="Exterior-focused"
                description="Purpose-built for outdoor property services, not a generic marketplace."
                header={
                  <BentoVisual
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                    alt="Modern home exterior with a manicured lawn"
                  />
                }
                icon={<Target className="w-4 h-4 text-cyan-500" />}
              />
              <BentoGridItem
                title="Verified providers"
                description="Every provider is vetted before they can bid on jobs on our platform."
                header={
                  <BentoVisual
                    src="https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=800&q=80"
                    alt="Professional mowing a residential lawn"
                  />
                }
                icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
              />
              <BentoGridItem
                title="Competitive bidding"
                description="Providers compete for your business. You pick the best price, rating, and fit."
                header={
                  <BentoVisual
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
                    alt="Comparing service quotes on a laptop"
                  />
                }
                icon={<Scale className="w-4 h-4 text-cyan-500" />}
              />
              <BentoGridItem
                className="md:col-span-2"
                title="Subscription plans"
                description="Set up a plan and your recurring services happen automatically, every time. Sticky providers stay assigned — no re-bidding."
                header={
                  <BentoVisual
                    src="https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=80"
                    alt="Lush green lawn maintained on a regular schedule"
                  />
                }
                icon={<Repeat className="w-4 h-4 text-cyan-500" />}
              />
              <BentoGridItem
                title="Sticky providers"
                description="Once a provider accepts your recurring jobs, they stay assigned."
                header={
                  <BentoVisual
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
                    alt="Crew working together on an exterior job site"
                  />
                }
                icon={<Users className="w-4 h-4 text-cyan-500" />}
              />
              <BentoGridItem
                className="md:col-span-2"
                title="Instant notifications"
                description="SMS and in-app updates at every stage — new bids, scheduling, and completion."
                header={
                  <BentoVisual
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=80"
                    alt="Checking job updates on a smartphone"
                  />
                }
                icon={<Bell className="w-4 h-4 text-emerald-500" />}
              />
            </BentoGrid>
          </div>
        </section>

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
                      onClick={goLogin}
                    >
                      Start for free
                    </HoverBorderGradient>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Crew management',
                      desc: 'Organize teams, assign members, and dispatch crews to jobs with one click.',
                    },
                    {
                      title: 'Smart scheduling',
                      desc: 'Calendar-based job scheduling with automatic conflict detection and reminders.',
                    },
                    {
                      title: 'Bid and win jobs',
                      desc: 'Browse open job requests in your area, submit competitive bids, and win new customers.',
                    },
                    {
                      title: 'Recurring revenue',
                      desc: 'Get assigned to subscription customers and earn steady recurring income — no re-bidding needed.',
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="flex gap-4 items-start p-4 rounded-2xl border backdrop-blur-sm border-white/10 bg-white/5"
                    >
                      <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-cyan-300 rounded-lg shrink-0 bg-cyan-500/20">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {item.title}
                        </h4>
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

        <section className="py-16">
          <div className="grid grid-cols-2 gap-8 px-6 mx-auto max-w-5xl text-center md:grid-cols-4">
            {[
              { value: '9+', label: 'Service categories' },
              { value: '24/7', label: 'Booking available' },
              { value: '100%', label: 'Verified providers' },
              { value: '3', label: 'Subscription plans' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60 sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24">
          <div className="px-6 mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <SectionEyebrow>FAQ</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Questions, answered
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-base hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="overflow-hidden relative py-24">
          <Spotlight
            className="-top-40 left-1/2 h-[80%] w-[80%] -translate-x-1/2"
            fill="#02ddf5"
          />
          <div className="relative px-6 mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight leading-tight text-foreground sm:text-5xl">
              Ready to transform your property?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Pick a subscription plan for hands-off recurring care, or post a
              one-time job and let providers compete for your business.
            </p>
            <div className="flex flex-col gap-4 justify-center items-center mt-10 sm:flex-row">
              <MovingBorderButton
                borderRadius="0.85rem"
                duration={2500}
                type="button"
                containerClassName="h-14 w-64"
                className="text-sm font-semibold text-white border-slate-800/60 bg-slate-950/80"
                onClick={goLogin}
              >
                Browse subscription plans
              </MovingBorderButton>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-14 rounded-xl"
                onClick={goLogin}
              >
                List your business
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t border-border">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <div className="flex gap-2 items-center mb-4">
                  <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-cyan-600 rounded-lg">
                    EP
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    Exterior Pro
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The all-in-one platform for exterior property services. Book,
                  track, and manage everything from your phone.
                </p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  For homeowners
                </h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {['Browse plans', 'Request a job', 'My properties'].map(
                    (label) => (
                      <li key={label}>
                        <Button
                          variant="link"
                          onClick={goLogin}
                          className="p-0 h-auto text-muted-foreground hover:text-foreground"
                        >
                          {label}
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  For providers
                </h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    'Join as provider',
                    'Manage crews',
                    'Provider dashboard',
                  ].map((label) => (
                    <li key={label}>
                      <Button
                        variant="link"
                        onClick={goLogin}
                        className="p-0 h-auto text-muted-foreground hover:text-foreground"
                      >
                        {label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  Company
                </h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <span className="cursor-default">About</span>
                  </li>
                  <li>
                    <Button
                      variant="link"
                      onClick={() => router.push('/privacy')}
                      className="p-0 h-auto text-muted-foreground hover:text-foreground"
                    >
                      Privacy Policy
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="link"
                      onClick={() => router.push('/terms')}
                      className="p-0 h-auto text-muted-foreground hover:text-foreground"
                    >
                      Terms of Service
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
            <Separator className="mt-12" />
            <div className="pt-8 text-sm text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} Exterior Pro. All rights
              reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
