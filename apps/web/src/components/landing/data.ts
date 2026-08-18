import { loginPath } from '@/lib/auth-intent';

export const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monthly', multiplier: 1, discount: 0 },
  { value: 'quarterly', label: 'Quarterly', multiplier: 0.95, discount: 5 },
  { value: 'annually', label: 'Annually', multiplier: 0.85, discount: 15 },
] as const;

export type BillingOption = (typeof BILLING_OPTIONS)[number]['value'];

export const PLANS = [
  {
    name: 'Basic Lawn Care',
    price: 99,
    period: '/mo',
    desc: 'The essentials, handled. Your yard stays cut and weed-free without a single phone call.',
    features: [
      'Bi-weekly lawn mowing',
      'Monthly weed control',
      'Matched to a verified local provider',
      'Pause or cancel anytime',
    ],
    highlight: false,
  },
  {
    name: 'Standard Exterior',
    price: 179,
    period: '/mo',
    desc: 'Our most popular plan. Weekly lawn care plus the seasonal work everyone forgets.',
    features: [
      'Weekly lawn mowing',
      'Monthly weed control',
      'Quarterly gutter cleaning',
      'A dedicated provider who stays on your property',
      'Before and after photos on every visit',
    ],
    highlight: true,
  },
  {
    name: 'Premium Exterior',
    price: 299,
    period: '/mo',
    desc: 'The full curb-appeal package. Everything outside your walls, on autopilot.',
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
      'Mowing, edging, trimming, and fertilization on a schedule you never have to think about.',
    image: '/services/lawn-maintenance.jpg',
    link: loginPath('customer'),
    tag: 'Weekly / Biweekly',
  },
  {
    title: 'Landscaping',
    description:
      'Design, planting, mulching, hardscaping, and seasonal cleanup from crews who do it daily.',
    image: '/services/landscaping.webp',
    link: loginPath('customer'),
    tag: 'Project or seasonal',
  },
  {
    title: 'Pressure Washing',
    description:
      'Driveways, siding, decks, patios, and fences taken back to like-new in a single visit.',
    image: '/services/pressure-washing.png',
    link: loginPath('customer'),
    tag: 'Most requested',
  },
  {
    title: 'Gutter Cleaning',
    description:
      'Full gutter and downspout clearing, flush, and guard installation before the next storm.',
    image: '/services/gutter-cleaning.jpg',
    link: loginPath('customer'),
    tag: 'Quarterly / Biannual',
  },
  {
    title: 'Weed Control',
    description:
      'Targeted treatments and pre-emergent applications that keep the lawn you paid for.',
    image: '/services/weed-control.webp',
    link: loginPath('customer'),
    tag: 'Monthly / Quarterly',
  },
  {
    title: 'Exterior Painting',
    description:
      'Proper prep and professional finish on siding, trim, fences, and decks.',
    image: '/services/exterior-painting.jpg',
    link: loginPath('customer'),
    tag: 'One-time',
  },
  {
    title: 'Window Cleaning',
    description:
      'Streak-free inside and out, for homes and commercial properties alike.',
    image: '/services/window-cleaning.jpg',
    link: loginPath('customer'),
    tag: 'Biannual / One-time',
  },
  {
    title: 'Roof Care',
    description:
      'Gentle soft washing, moss removal, and preventive maintenance that adds years.',
    image: '/services/roof-care.jpeg',
    link: loginPath('customer'),
    tag: 'Biannual',
  },
  {
    title: 'Tree & Shrub Care',
    description:
      'Pruning, trimming, health checks, and removals handled by insured crews.',
    image: '/services/tree-and-shrub-care.jpg',
    link: loginPath('customer'),
    tag: 'Seasonal / One-time',
  },
] as const;

export const SERVICE_TICKER = [
  'Lawn mowing',
  'Gutter cleaning',
  'Pressure washing',
  'Weed control',
  'Landscaping',
  'Window cleaning',
  'Roof soft wash',
  'Exterior painting',
  'Fence & deck',
  'Tree & shrub care',
  'Holiday lighting',
  'Seasonal cleanup',
] as const;

export const STATS = [
  {
    value: 12400,
    suffix: '+',
    label: 'Jobs completed',
    caption: 'Across lawn, gutter, wash, and paint work',
  },
  {
    value: 4,
    suffix: ' hrs',
    label: 'Average time to first bid',
    caption: 'Most jobs get three bids the same day',
  },
  {
    value: 4.9,
    decimals: 1,
    suffix: '/5',
    label: 'Average provider rating',
    caption: 'Rated by homeowners after every completed visit',
  },
  {
    value: 38,
    suffix: '%',
    label: 'Average revenue lift',
    caption: 'Reported by providers in their first six months',
  },
] as const;

export const HOW_IT_WORKS_CUSTOMER = [
  {
    step: '01',
    heading: 'Tell us about your property',
    body: 'Add your address and pick what you need. Subscribe to a recurring plan or post a one-time job. It takes under two minutes.',
    detail: 'No account fees. No sales call.',
  },
  {
    step: '02',
    heading: 'Verified pros compete',
    body: 'Local providers in your service area see the job and send real bids with pricing and availability, usually within hours.',
    detail: 'Every provider is vetted before they can bid.',
  },
  {
    step: '03',
    heading: 'Pick your pro',
    body: 'Compare bids side by side on price, rating, and notes. Accept the one you want and pay securely through Stripe.',
    detail: 'You are never auto-matched to someone you did not choose.',
  },
  {
    step: '04',
    heading: 'Watch it get done',
    body: 'Track the job from scheduled to complete, get SMS updates at every step, and see before and after photos when the crew finishes.',
    detail: 'The same crew stays on your recurring plan.',
  },
] as const;

export const HOW_IT_WORKS_PROVIDER = [
  {
    step: '01',
    heading: 'Set up in an afternoon',
    body: 'Create your business profile, choose the services you offer, set your service area, and connect Stripe for payouts.',
    detail: 'No monthly software fee to get started.',
  },
  {
    step: '02',
    heading: 'Bid on real work',
    body: 'See open jobs in your zip codes with property details up front. Send a price and timing, and win the ones that fit your route.',
    detail: 'No shared leads. No paying for phone numbers.',
  },
  {
    step: '03',
    heading: 'Dispatch your crews',
    body: 'Schedule jobs on one calendar, assign crews, and let your team run the day from the field app on their phones.',
    detail: 'Before and after photos are captured on site.',
  },
  {
    step: '04',
    heading: 'Keep the recurring book',
    body: 'Subscription customers stay assigned to you. Predictable routes, predictable revenue, and payouts land after each completed job.',
    detail: 'You never re-bid a customer you already earned.',
  },
] as const;

export const PROVIDER_FEATURES = [
  {
    title: 'Crew management',
    desc: 'Build teams, assign members, and dispatch to jobs in one click instead of a group text thread.',
  },
  {
    title: 'Smart scheduling',
    desc: 'One calendar for every job, with reminders that keep the route tight and the day on track.',
  },
  {
    title: 'Bid on open jobs',
    desc: 'Browse real requests in your area with property details, then bid the number that works for you.',
  },
  {
    title: 'Recurring revenue',
    desc: 'Get assigned to subscription customers and hold that book of work without re-bidding every visit.',
  },
  {
    title: 'Field app for the crew',
    desc: 'Your team starts jobs, uploads before and after photos, and closes them out from their phones.',
  },
  {
    title: 'Payouts on completion',
    desc: 'Stripe Connect deposits land after work is marked complete. No invoicing, no chasing checks.',
  },
] as const;

export const TRUST_ITEMS = [
  {
    value: 'Verified',
    label: 'Every provider is vetted before they bid or take a plan',
  },
  {
    value: 'No lock-in',
    label: 'Pause or cancel a subscription anytime, no contracts',
  },
  {
    value: 'Two ways to hire',
    label: 'Recurring plans and on-demand jobs in one place',
  },
  {
    value: 'Photo proof',
    label: 'Before and after photos on every completed job',
  },
] as const;

export const HOMEOWNER_TESTIMONIALS = [
  {
    quote:
      'I had been calling three different companies for mowing, gutters, and the driveway. Now it is one plan and the same crew shows up every week without me asking.',
    name: 'Marcus Webb',
    title: 'Homeowner, Franklin TN',
  },
  {
    quote:
      'Posted a gutter job on a Tuesday morning and had four bids before lunch. Picked the one with the best rating and it was done Thursday.',
    name: 'Priya Raman',
    title: 'Homeowner, Cary NC',
  },
  {
    quote:
      'The before and after photos are the part I did not expect to love. I travel a lot and I can actually see the work got done.',
    name: 'Dana Kessler',
    title: 'Homeowner, Scottsdale AZ',
  },
  {
    quote:
      'I manage six rentals and this replaced an entire spreadsheet. Each property has its own plan and I stopped fielding tenant complaints about the yard.',
    name: 'Anthony Cole',
    title: 'Property manager, Columbus OH',
  },
  {
    quote:
      'Paused the plan over winter, turned it back on in March. No phone tree, no cancellation fee, no guilt trip.',
    name: 'Renee Alvarado',
    title: 'Homeowner, Boise ID',
  },
] as const;

export const PROVIDER_TESTIMONIALS = [
  {
    quote:
      'I stopped buying shared leads. Here I see the actual property and the actual job before I put a number on it, so my close rate went way up.',
    name: 'Derek Hollis',
    title: 'Owner, Hollis Lawn & Landscape',
  },
  {
    quote:
      'The subscription customers are the whole thing for me. Twenty-two recurring properties means I know what February looks like in December.',
    name: 'Sam Ortiz',
    title: 'Owner, Ortiz Exterior Services',
  },
  {
    quote:
      'My crews run the day off their phones now. Photos go up on site, jobs close out on site, and I am not driving around verifying work.',
    name: 'Tyler Brandt',
    title: 'Operations lead, Brandt Property Care',
  },
  {
    quote:
      'Payouts hit after the job is marked complete. I went from chasing invoices for three weeks to not thinking about it at all.',
    name: 'Marisol Vega',
    title: 'Owner, Vega Pressure Washing',
  },
  {
    quote:
      'I added two trucks in eight months. The routes are tight because the work is clustered, not scattered across the metro.',
    name: 'Chris Nakamura',
    title: 'Owner, Summit Exterior Co.',
  },
] as const;

export const FAQS = [
  {
    q: 'What is the difference between a plan and a one-time job?',
    a: 'A plan is a recurring subscription. Your provider shows up on a set cadence so lawn care, weed control, and seasonal work happen automatically. A one-time job is posted to the marketplace, where verified providers submit bids you compare and accept.',
  },
  {
    q: 'Can I pause or cancel a subscription?',
    a: 'Yes, anytime, from your account. There is no long-term contract and no cancellation fee. Plenty of customers pause over winter and resume in spring.',
  },
  {
    q: 'How do you vet providers?',
    a: 'Every provider is reviewed and verified before they can bid on a job or take on subscription work. They also have to complete Stripe payout onboarding and agree to our contractor terms, which cover their own licensing and insurance.',
  },
  {
    q: 'When am I charged?',
    a: 'For one-time jobs, you are charged when you accept a bid. For plans, you are billed on the cadence you pick. Exterior Pro is the merchant of record, so payments and refunds run through us rather than a stranger with a card reader.',
  },
  {
    q: 'Do I get the same crew every time?',
    a: 'On a recurring plan, yes. Once a provider is assigned to your subscription they stay on it. There is no re-bidding and no new face at the door every visit.',
  },
  {
    q: 'How do providers get work here?',
    a: 'Two ways. Bid on open one-time jobs in your service area, and get assigned to subscription customers as their dedicated provider. There are no shared leads and you are not paying for a phone number that four other companies also bought.',
  },
  {
    q: 'What does it cost a provider to join?',
    a: 'Nothing to sign up, build a profile, or bid. A platform fee is taken out of completed jobs, and the rest is transferred to your Stripe account after the work is marked complete.',
  },
  {
    q: 'Is this only for homeowners?',
    a: 'No. Homeowners, landlords, and property managers all use it on the customer side, and exterior service businesses of every size use the provider side for bidding, crews, and scheduling.',
  },
] as const;

export const FOOTER_HOMEOWNER_LINKS = [
  { label: 'Browse plans', href: loginPath('customer') },
  { label: 'Post a job', href: loginPath('customer') },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Services', href: '#services' },
] as const;

export const FOOTER_PROVIDER_LINKS = [
  { label: 'Join as a provider', href: loginPath('provider') },
  { label: 'Provider dashboard', href: loginPath('provider') },
  { label: 'Crew management', href: '#providers' },
  { label: 'Contractor agreement', href: '/contractor-agreement' },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
] as const;
