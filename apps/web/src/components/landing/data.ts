import { loginPath } from '@/lib/auth-intent';

export const PLANS = [
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
] as const;

export type Plan = (typeof PLANS)[number];

export const SERVICES = [
  {
    title: 'Lawn Maintenance',
    description:
      'Weekly or biweekly mowing, edging, trimming, fertilization, and weed control programs.',
    link: loginPath('customer'),
    tag: 'Weekly / Biweekly',
  },
  {
    title: 'Landscaping',
    description:
      'Full-service design, planting, mulching, hardscaping, and seasonal cleanup.',
    link: loginPath('customer'),
    tag: 'Weekly / Biweekly',
  },
  {
    title: 'Weed Control',
    description:
      'Targeted treatments, pre-emergent applications, and ongoing prevention programs.',
    link: loginPath('customer'),
    tag: 'Monthly / Quarterly',
  },
  {
    title: 'Gutter Cleaning',
    description:
      'Thorough gutter and downspout cleaning, guard installation, and debris removal.',
    link: loginPath('customer'),
    tag: 'Quarterly / Biannual',
  },
  {
    title: 'Pressure Washing',
    description:
      'Driveways, siding, decks, patios, and fences restored to like-new condition.',
    link: loginPath('customer'),
    tag: 'Most popular',
  },
  {
    title: 'Exterior Painting',
    description:
      'Professional prep and painting for siding, trim, fences, decks, and more.',
    link: loginPath('customer'),
    tag: 'One-time',
  },
  {
    title: 'Window Cleaning',
    description:
      'Streak-free interior and exterior cleaning for homes and commercial properties.',
    link: loginPath('customer'),
    tag: 'Biannual / One-time',
  },
  {
    title: 'Roof Care',
    description:
      'Gentle roof soft washing, moss removal, and preventive maintenance.',
    link: loginPath('customer'),
    tag: 'Biannual',
  },
  {
    title: 'Tree & Shrub Care',
    description:
      'Pruning, trimming, health assessments, and removal for all property types.',
    link: loginPath('customer'),
    tag: 'Seasonal / One-time',
  },
];

export const CAPABILITY_CARDS = [
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

export const HOW_IT_WORKS_CUSTOMER = [
  {
    title: '01',
    heading: 'Choose a plan or post a job',
    body: 'Subscribe to recurring services or post a one-time job with your property details. It takes less than two minutes.',
  },
  {
    title: '02',
    heading: 'Providers bid',
    body: 'Verified local providers in your area see the job and submit competitive bids with pricing and availability.',
  },
  {
    title: '03',
    heading: 'Pick your pro',
    body: 'Compare bids side by side — pricing, provider ratings, and notes. Accept the best fit with one click.',
  },
  {
    title: '04',
    heading: 'Sit back and relax',
    body: 'Your provider handles everything. Track progress in real time and get notified when work is complete.',
  },
] as const;

export const HOW_IT_WORKS_PROVIDER = [
  {
    title: '01',
    heading: 'Set up your business',
    body: 'Create a profile, add the services you offer, and get verified. You are ready to work in minutes, not weeks.',
  },
  {
    title: '02',
    heading: 'Bid and win the right jobs',
    body: 'See open requests in your area. Bid on one-time work, or get assigned to subscription customers who need a dedicated crew.',
  },
  {
    title: '03',
    heading: 'Dispatch from one calendar',
    body: 'Assign crews, catch conflicts automatically, and keep every job on schedule — without a stack of group texts.',
  },
  {
    title: '04',
    heading: 'Keep the recurring book',
    body: 'Sticky subscription customers stay with you. No re-bidding every visit — just scheduled work and predictable revenue.',
  },
] as const;

export const PROVIDER_FEATURES = [
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
] as const;

export const TRUST_ITEMS = [
  {
    value: 'Verified',
    label: 'Every provider is vetted before they bid or take a plan',
  },
  {
    value: 'No lock-in',
    label: 'Pause or cancel a subscription anytime — no contracts',
  },
  {
    value: 'Two ways to hire',
    label: 'Recurring plans and on-demand jobs in one place',
  },
  {
    value: 'Crew ops',
    label: 'Scheduling, dispatch, and a book of recurring work',
  },
] as const;

export const FAQS = [
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
    q: 'How do providers get work on Exterior Pro?',
    a: 'Bid on open one-time jobs in your area, and get assigned to subscription customers as a sticky provider. Recurring plans stay with you — you do not re-bid every visit.',
  },
  {
    q: 'Is Exterior Pro only for homeowners?',
    a: 'No. Homeowners, property managers, and exterior service businesses all use the platform — customers for plans and jobs, providers for crews, scheduling, and recurring revenue.',
  },
] as const;

export const FOOTER_HOMEOWNER_LINKS = [
  { label: 'Browse plans', href: loginPath('customer') },
  { label: 'Request a job', href: loginPath('customer') },
  { label: 'My properties', href: loginPath('customer') },
] as const;

export const FOOTER_PROVIDER_LINKS = [
  { label: 'Join as provider', href: loginPath('provider') },
  { label: 'Manage crews', href: loginPath('provider') },
  { label: 'Provider dashboard', href: loginPath('provider') },
] as const;
