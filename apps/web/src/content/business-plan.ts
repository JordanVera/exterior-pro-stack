/**
 * Interior operating plan for Exterior Pro.
 * Update this module when strategy, pricing, or launch assumptions change.
 * Last written: August 23, 2026.
 */

export const PLAN_UPDATED = 'August 23, 2026';

export type CalloutTone = 'amber' | 'lime' | 'red' | 'muted';

export type PlanTableRow = {
  cells: string[];
  tone?: 'danger' | 'ok';
};

export type PlanBlock =
  | { type: 'prose'; paragraphs: string[] }
  | { type: 'callout'; tone: CalloutTone; title: string; body: string }
  | {
      type: 'table';
      caption?: string;
      columns: string[];
      rows: PlanTableRow[];
    }
  | {
      type: 'list';
      ordered?: boolean;
      items: { title: string; body: string }[];
    }
  | { type: 'kvs'; items: { label: string; value: string }[] };

export type PlanSection = {
  id: string;
  navLabel: string;
  title: string;
  summary: string;
  blocks: PlanBlock[];
};

export const PLAN_META = {
  eyebrow: 'Company',
  title: 'Operating plan',
  subtitle:
    'Internal playbook for Exterior Pro: how money works, where margin is healthy, how to launch one metro, and what to build next.',
};

export const PLAN_ASSUMPTIONS = [
  'Beachhead metro is Greater Houston (matches seed/demo ZIPs). Do not go national on day one.',
  'Legal entity, EIN, business bank account, and GL insurance are not in the product — they are company work below.',
  'Landing-page stats (job counts, 4.9 rating, provider revenue lift) are marketing copy, not ops data.',
  'Platform take on one-time jobs is 10% (PLATFORM_FEE_BPS=1000) plus estimated Stripe processing of 2.9% + $0.30, deducted before the provider transfer.',
  'Twelve-month numbers are planning scenarios, not forecasts.',
];

export const PLAN_SECTIONS: PlanSection[] = [
  {
    id: 'snapshot',
    navLabel: 'Snapshot',
    title: 'Snapshot',
    summary:
      'Exterior-only merchant of record: recurring plans for homeowners, a bid marketplace for one-time work, and Stripe Connect payouts for independent crews.',
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Exterior Pro is a two-sided exterior-services platform. Homeowners and property managers subscribe to recurring lawn, gutter, and exterior care, or post a one-time job and let verified local providers compete on price. The company is merchant of record: the customer receipt says Exterior Pro, refunds and disputes sit with the platform, and providers are paid as independent contractors after the visit is complete.',
          'This is not a lead-gen site. Angi and Thumbtack sell shared leads and step out. Exterior Pro owns pricing, holds funds until the work is done (separate charges and transfers), assigns the same crew to a subscription, and runs dispatch from a web portal plus a field app. The brand promise is “a system for keeping a property up,” not another inbox of contractor quotes.',
        ],
      },
      {
        type: 'kvs',
        items: [
          {
            label: 'Thesis',
            value:
              'Own the customer relationship, hold funds until work is done, pay crews via Connect.',
          },
          {
            label: 'Plans',
            value:
              'Basic $99 / Standard $179 / Premium $299 per month (quarterly and annual discounts).',
          },
          {
            label: 'Marketplace',
            value:
              'Customer posts → verified ZIP-matched providers bid → charge on accept → transfer on complete.',
          },
          {
            label: 'Take rate',
            value:
              '10% of one-time job GMV. Subscriptions: keep the plan price, pay a contracted per-visit rate.',
          },
          {
            label: 'Beachhead',
            value:
              'Greater Houston. Providers define serviceAreaZips; seed data is Houston metro.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'muted',
        title: 'Stage',
        body: 'Web marketplace is launch-capable: Checkout, Billing, Connect onboarding, transfer-on-complete, subscription job cron, admin catalog and money views, native field + customer apps. Trust layer is incomplete (no reviews model). Legal pages are launch drafts pending counsel. Do not treat marketing stats on the landing page as operating metrics — use the live snapshot above.',
      },
    ],
  },
  {
    id: 'money',
    navLabel: 'How money works',
    title: 'How money works',
    summary:
      'Two flows, one merchant of record. Marketplace jobs take 10% net. Subscriptions bill the customer on a cadence and pay providers per completed visit from platform float.',
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Stripe Connect is Express, platform-priced, platform-liable for losses, with separate charges and transfers. Destination charges are not used: they would move money to the provider immediately and cannot wait for job completion. Stripe Billing also does not pair cleanly with destination charges.',
          'Providers cannot bid until payouts are enabled on their connected account. Exterior Pro collects on the platform, holds until the job is COMPLETED, then transfers the provider share. Refunds and disputes reverse the transfer.',
        ],
      },
      {
        type: 'list',
        items: [
          {
            title: 'Flow A — Recurring plans',
            body: 'Customer picks plan + property + cadence (monthly / quarterly / annually) → Stripe Checkout (Billing) → webhook creates CustomerSubscription. Cron generates Job rows from PlanService frequencies. Assigned provider (or ZIP broadcast if none) completes the visit → transfer. Customer pause/cancel goes through the Billing Portal.',
          },
          {
            title: 'Flow B — One-time jobs',
            body: 'Customer posts OPEN job → verified providers in matching ZIP + service notify and bid. Customer accepts → Stripe Checkout for the bid amount → job PENDING. Schedule → IN_PROGRESS → COMPLETED → transfer bid − 10% − estimated Stripe processing.',
          },
        ],
      },
      {
        type: 'table',
        caption:
          'Worked example: $175 one-time job at the default 10% take and estimated 2.9% + $0.30 processing. Platform net is the 10% fee; processing is estimated in the split so the Connect transfer does not eat the take.',
        columns: ['Line', 'Amount', 'Notes'],
        rows: [
          {
            cells: [
              'Customer charge',
              '$175.00',
              'Bid price; Exterior Pro is merchant of record',
            ],
          },
          {
            cells: [
              'Estimated Stripe processing',
              '$5.38',
              'round($175 × 2.9%) + $0.30',
            ],
          },
          { cells: ['Platform fee (10%)', '$17.50', 'PLATFORM_FEE_BPS=1000'] },
          {
            cells: [
              'Provider transfer',
              '$152.12',
              '$175 − $17.50 − $5.38, sent on job complete',
            ],
            tone: 'ok',
          },
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          'Subscription billing is different. The customer is charged the plan price on cadence. Visit jobs still create a Payment row using catalog basePrice (or the provider’s customPrice) and the same splitCharge math, then transfer that amount when the visit completes. That means plan cash-in and visit cash-out are not the same number — which is the unit-economics problem in the next section.',
        ],
      },
    ],
  },
  {
    id: 'unit-economics',
    navLabel: 'Unit economics',
    title: 'Unit economics',
    summary:
      'Marketplace jobs at 10% are the healthy line. Subscriptions are underwater if providers are paid catalog basePrice. Do not scale plans until contracted per-visit rates are locked.',
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Catalog list prices exist so customers see a starting point and providers can set customPrice. They are not a cost of goods sold for plans. Today the subscription cron pays customPrice ?? service.basePrice on each generated visit, then runs splitCharge. At those rates every seeded plan loses money on fulfillment before overhead.',
        ],
      },
      {
        type: 'table',
        caption:
          'Annual catalog fulfillment vs plan billings if every visit is paid at seeded basePrice. Frequencies: weekly 52, bi-weekly 26, monthly 12, quarterly 4, biannual 2. Launch mix is lawn + fert + gutters + wash; windows stay marketplace-only.',
        columns: [
          'Plan',
          'Billings / mo',
          'Catalog COGS / mo',
          'Gap / mo',
          'Gap / yr',
        ],
        rows: [
          {
            cells: ['Basic Lawn Care', '$99', '~$209', '−$110', '−$1,320'],
            tone: 'danger',
          },
          {
            cells: ['Standard Exterior', '$179', '~$335', '−$156', '−$1,872'],
            tone: 'danger',
          },
          {
            cells: ['Premium Exterior', '$299', '~$427', '−$128', '−$1,536'],
            tone: 'danger',
          },
        ],
      },
      {
        type: 'table',
        caption:
          'How the catalog math stacks (Standard Exterior is the landing “most popular”).',
        columns: [
          'Included service',
          'Frequency',
          'Catalog rate',
          'Monthly equivalent',
        ],
        rows: [
          { cells: ['Weekly lawn mowing', '52 / yr', '$45 flat', '$195'] },
          { cells: ['Weed control', '12 / yr', '$65 flat', '$65'] },
          { cells: ['Lawn fertilization', '4 / yr', '$75 flat', '$25'] },
          { cells: ['Gutter clean & flush', '4 / yr', '$150 flat', '$50'] },
          {
            cells: ['Standard total', '', '', '$335 vs $179 plan'],
            tone: 'danger',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'red',
        title: 'Operator rule',
        body: 'Do not sell a plan in a ZIP until the assigned crew has signed the rate card for every visit on that tier: Basic = bi-weekly mow + monthly weed + quarterly fert; Standard adds quarterly gutter; Premium adds quarterly driveway and biannual siding wash. Marketplace one-time jobs at 10% can scale now. Visit payout still reads customPrice ?? basePrice in subscription-jobs.ts — contracted rates must live on ProviderService.customPrice.',
      },
      {
        type: 'table',
        caption:
          'Houston launch rate card. Sign these before selling the matching tier. Standard ~12% contribution only at the low end after Stripe Billing (~$5.50 on $179); mid targets are roughly break-even once quarterly fert is included. Planning rates, not live prices.',
        columns: [
          'Visit',
          'Catalog',
          'Contract target',
          'Monthly at frequency',
          'Required on',
        ],
        rows: [
          { cells: ['Bi-weekly mow', '$55', '$28–35', '~$61–76', 'Basic'] },
          { cells: ['Weekly mow', '$45', '$22–28', '~$95–121', 'Standard, Premium'] },
          { cells: ['Monthly weed', '$65', '$25–35', '$25–35', 'All'] },
          { cells: ['Quarterly fert', '$75', '$30–40', '$10–13', 'All'] },
          { cells: ['Quarterly gutter', '$150', '$60–80', '$20–27', 'Standard, Premium'] },
          { cells: ['Quarterly driveway', '$150', '$70–90', '$23–30', 'Premium'] },
          { cells: ['Biannual siding', '$250', '$100–140', '$17–23', 'Premium'] },
          {
            cells: ['Standard COGS (low end)', '$335', '', '~$150', ''],
            tone: 'ok',
          },
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          'Why providers would accept that: density. A $25 weekly mow on a tight ZIP route with five neighbors is better than a $45 one-off across town. Sell density and recurring book, not list price. If a provider will not sign a rate card, keep them on the one-time bid marketplace only.',
          'Healthy unit: a $175 gutter job. Platform nets ~$17.50 (10%). Unhealthy unit: a Standard subscriber fulfilled at catalog. Platform bills $179 and owes ~$335 of visits (or ~$302 after the 10% split on those visit records — still underwater). Until rate cards exist, treat subscription contribution as zero or negative in any target model.',
        ],
      },
    ],
  },
  {
    id: 'supply-demand',
    navLabel: 'Supply and demand',
    title: 'Supply and demand',
    summary:
      'Chicken-egg in one metro. Verify 10–15 Greater Houston providers with Connect payouts in a tight ZIP cluster, then pour homeowner demand into those same ZIPs.',
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'A two-sided marketplace dies from empty bid lists, not from a thin landing page. Matching today is: verified provider, offers the service, serviceAreaZips contains the property ZIP (or null = all ZIPs). That is enough for a beachhead and will break if you go wide. Do not recruit statewide until one cluster has same-day first bids.',
        ],
      },
      {
        type: 'list',
        ordered: true,
        items: [
          {
            title: 'Supply first (weeks 1–4)',
            body: 'Personally onboard 10–15 lawn, gutter, and wash operators in a small Houston / inner-loop set (seed ZIPs include 77008 Heights, 77019 River Oaks, 77002 downtown, then 77494 Katy). Require Stripe Connect payouts_enabled and a rate card for any plan work. Verification is a human admin step — use it.',
          },
          {
            title: 'Demand into those ZIPs (weeks 3–8)',
            body: 'Landing already splits homeowners vs providers (?intent=customer|provider). Run local demand only where supply exists. Offer one-time jobs immediately. Offer Basic only if mow + weed + fert rates are signed; Standard only with gutter added; Premium only with driveway and siding wash added. Hold Standard/Premium in any ZIP that lacks those cards.',
          },
          {
            title: 'Recurring density (months 2–6)',
            body: 'Subscriptions are the lock-in: same crew, no re-bid, cron-generated visits. Cluster properties on routes. A provider who holds 8 weekly lawns in one neighborhood will defend the rate card. Scattershot ZIPs will not.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'lime',
        title: 'Who we serve',
        body: 'Customers: homeowners, landlords, and property managers (no dedicated PROPERTY_MANAGER role yet — they use a customer login plus multiple properties). Providers: independent exterior businesses of any size. Crews execute in the native field app; they do not use the web portal.',
      },
      {
        type: 'prose',
        paragraphs: [
          'National testimonial cities on the landing page (Franklin, Cary, Scottsdale, etc.) are marketing placeholders. Ops geography is Greater Houston until liquidity is real. Expand city-by-city with feature flags later — not with a national provider blast.',
        ],
      },
    ],
  },
  {
    id: 'product',
    navLabel: 'Product',
    title: 'Product today vs next',
    summary:
      'Launch blockers on money and fulfillment are built. Next work is trust and ops: reviews, photo proof, messaging, calendar, insurance — then commercial surface area.',
    blocks: [
      {
        type: 'table',
        caption:
          'What is live versus what still reads as an MVP to a paying customer.',
        columns: ['Layer', 'Live', 'Not yet'],
        rows: [
          {
            cells: [
              'Money',
              'Checkout, Billing, Connect, transfer-on-complete, receipts, admin GMV/payouts',
              'Stripe Tax, refunds UI, destination-charge alternative',
            ],
          },
          {
            cells: [
              'Fulfillment',
              'Subscription cron, bid expiry, SMS/email, job photos (Blob), field app start/complete',
              'Route grouping, week calendar, checklists/materials',
            ],
          },
          {
            cells: [
              'Trust',
              'Admin verify, contractor agreement, Connect gate on bidding',
              'Reviews/ratings, COI upload, background checks',
            ],
          },
          {
            cells: [
              'Surfaces',
              'Customer / provider / admin web; native field + customer',
              'Property-manager org role, App Store/Play production, in-app chat',
            ],
          },
        ],
      },
      {
        type: 'list',
        ordered: true,
        items: [
          {
            title: 'Now (as soon as first paid jobs exist)',
            body: 'Reviews after completion. Before/after photos as the default trust object. In-app messaging (keep SMS for urgent). Provider week calendar. COI / insurance attestation. Support path that can look up a user by phone.',
          },
          {
            title: 'Next (full-suite)',
            body: 'Property manager role, commercial quotes, service-area polygons, route optimization, Checkr-style background checks, PostHog funnel, city feature flags, App Store / Play after the Expo app is production-ready.',
          },
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          'Do not block Houston launch on mobile store listings or chat. Crews already have a field app; providers still bid and manage Connect on the web. Reviews and photo proof will do more for conversion than another surface.',
        ],
      },
    ],
  },
  {
    id: 'targets',
    navLabel: '12-month targets',
    title: '12-month operator targets',
    summary:
      'Conservative Greater Houston planning scenarios. Not forecasts. Job take is 10% of one-time GMV. Plan contribution is only real after contracted visit rates.',
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'These numbers assume a single-metro launch, supply-first onboarding, and that Standard/Premium are sold only with rate cards. If catalog visit prices stay in the payout path, drop the plan-revenue line to near zero contribution and grow one-time jobs instead.',
        ],
      },
      {
        type: 'table',
        caption:
          'Liquidity and revenue planning scenario. Monthly plan revenue is billings (cash in), not profit. Job GMV is one-time marketplace volume.',
        columns: ['Metric', 'Month 3', 'Month 6', 'Month 12'],
        rows: [
          { cells: ['Verified providers (Connect on)', '12', '18', '28'] },
          { cells: ['Active subscriptions', '15', '40', '90'] },
          { cells: ['One-time jobs completed / mo', '20', '45', '90'] },
          { cells: ['Monthly plan billings', '$2,000', '$6,000', '$14,000'] },
          { cells: ['Monthly one-time GMV', '$4,000', '$9,000', '$18,000'] },
          {
            cells: ['Job take @ 10%', '$400', '$900', '$1,800'],
            tone: 'ok',
          },
          {
            cells: [
              'Plan contribution @ ~12% (if rate cards)',
              '$240',
              '$720',
              '$1,680',
            ],
          },
          {
            cells: [
              'Combined contribution / mo',
              '~$640',
              '~$1,620',
              '~$3,480',
            ],
          },
        ],
      },
      {
        type: 'table',
        caption:
          'Illustrative month-12 subscription mix. Keep Basic heavier until Standard unit economics are proven in the field.',
        columns: ['Plan', 'Share of 90 subs', 'Count', 'Monthly billings'],
        rows: [
          { cells: ['Basic Lawn Care ($99)', '45%', '40', '$3,960'] },
          { cells: ['Standard Exterior ($179)', '40%', '36', '$6,444'] },
          { cells: ['Premium Exterior ($299)', '15%', '14', '$4,186'] },
          { cells: ['Total', '100%', '90', '$14,590'] },
        ],
      },
      {
        type: 'callout',
        tone: 'amber',
        title: 'Read against the live snapshot',
        body: 'The tiles at the top of this page are actuals from admin.getStats (users, verified providers, jobs, GMV, subscriptions, payouts). They are not these targets. If live GMV is seed/demo data, ignore it for planning. Replace these rows when a real month of Houston activity exists.',
      },
    ],
  },
  {
    id: 'risks',
    navLabel: 'Risks',
    title: 'Risks and open decisions',
    summary:
      'The plan fails if subscriptions scale on catalog rates, if supply is thin in the bid ZIP, or if the company never becomes a real legal entity.',
    blocks: [
      {
        type: 'list',
        items: [
          {
            title: 'Negative subscription margin',
            body: 'Highest-probability financial failure. Cron currently prices visits at catalog. Selling Standard at $179 while paying ~$335 of visits burns cash on every happy customer. Mitigation: sign the launch rate card before volume; or raise/cut plans.',
          },
          {
            title: 'Empty bid lists',
            body: 'Customers who post a job and wait will not return. Mitigation: supply-first, tight ZIPs, admin verification queue, SMS on new jobs. Do not run broad demand ads into empty areas.',
          },
          {
            title: 'Holding funds and disputes',
            body: 'Merchant of record means Exterior Pro owns refunds, chargebacks, and incomplete work. Connect losses_collector is the application. Mitigation: transfer only on COMPLETED, photo proof, later reviews, counsel on Terms.',
          },
          {
            title: 'No reviews yet',
            body: 'Landing cites 4.9/5. Product has no rating model. First real customers will notice. Mitigation: ship reviews as the first trust feature after paid traffic.',
          },
          {
            title: 'Legal and insurance',
            body: 'Terms, Privacy, and the contractor agreement are launch drafts (counsel review noted). Some states treat marketplaces as contractors. Providers need GL; the platform should too. Mitigation: entity + insurance before meaningful GMV.',
          },
          {
            title: 'Two money systems',
            body: 'Plan billings (Stripe Billing) and visit Payments (splitCharge on catalog) can double-count GMV in admin if subscription visit Payment rows are treated like customer charges. Read GMV with kind in mind (JOB vs SUBSCRIPTION).',
          },
        ],
      },
      {
        type: 'table',
        caption:
          'Decisions that are still open. Resolve these in ops, not only in code.',
        columns: ['Decision', 'Current default', 'Owner action'],
        rows: [
          {
            cells: [
              'Launch ZIPs',
              'Houston seed list, unbounded in product',
              'Publish a launch ZIP allowlist',
            ],
          },
          {
            cells: [
              'Plan visit pay',
              'catalog basePrice / customPrice',
              'Sign rate cards; stop using list price',
            ],
          },
          {
            cells: [
              'Take rate',
              '10% jobs; plans keep sticker price',
              'Revisit only after 50 completed jobs',
            ],
          },
          {
            cells: [
              'Legal entity',
              'Not in repo',
              'Form LLC/Inc., EIN, bank, Stripe identity',
            ],
          },
          {
            cells: [
              'Counsel on legal pages',
              'Draft as of Aug 2026',
              'Replace before paid ads',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'company-work',
    navLabel: 'Company work',
    title: 'Company work (non-code)',
    summary:
      'Software will not make this look like a company. Entity, insurance, tax, and a defined launch city will.',
    blocks: [
      {
        type: 'list',
        ordered: true,
        items: [
          {
            title: 'Legal entity and banking',
            body: 'Form the LLC or corporation, EIN, business bank account, and Stripe platform identity that match the legal name on customer receipts. Support inbox: support@exteriorpro.app.',
          },
          {
            title: 'Insurance',
            body: 'Platform general liability. Require provider COI before verification at volume. Attestation in-product comes later; a spreadsheet is enough for the first dozen providers.',
          },
          {
            title: 'Stripe Tax and nexus',
            body: 'Do not turn on Stripe Tax until you know where you have nexus and have registrations. Processing is already estimated in splitCharge; sales tax is a separate obligation.',
          },
          {
            title: 'Launch city, for real',
            body: 'Write the ZIP list, put it on the landing “we serve” copy, and reject or waitlist jobs outside it. Seed data is Greater Houston; product currently allows any ZIP a provider types.',
          },
          {
            title: 'Counsel',
            body: 'Terms, Privacy, Independent Contractor Agreement, and whether Texas (or other states) treat this marketplace as a contractor-broker. Launch drafts are not a substitute.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'muted',
        title: 'How to update this document',
        body: 'This page is view-only. Edit apps/web/src/content/business-plan.ts and ship. Live tiles stay on admin.getStats. Print / Save as PDF from the button in the header.',
      },
    ],
  },
];
