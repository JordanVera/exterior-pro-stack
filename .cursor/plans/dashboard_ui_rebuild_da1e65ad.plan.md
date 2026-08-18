---
name: Dashboard UI rebuild
overview: Rebuild the customer and provider dashboard homes around a new shared dashboard design system that carries the landing page's visual language (lime glow, glass panels, glowing borders, count-up stats) with restrained motion, and expand both pages with richer information architecture backed by additional tRPC queries.
todos:
  - id: design-system
    content: 'Build shared dashboard primitives in apps/web/src/components/dashboard/: dashboard-hero.tsx, stat-tiles.tsx, section-panel.tsx, quick-actions.tsx, empty-state.tsx'
    status: completed
  - id: customer-data
    content: Extend the customer dashboard data fetch with subscription.listForCustomer and payment.listForCustomer, and derive the stat values
    status: in_progress
  - id: customer-page
    content: 'Rewrite the customer dashboard page: hero band, stat tiles, tabbed job feed, sticky right rail, property carousel, new skeleton'
    status: pending
  - id: customer-components
    content: Add customer _components job-feed.tsx and property-carousel.tsx; restyle job-card, recent-activity-section, first-property-prompt; retire greeting/needs-attention/upcoming/property sections
    status: pending
  - id: provider-data
    content: Extend the provider dashboard data fetch with job.listOpen, job.listMyBids, crew.list, payment.listForProvider, and derive stats client-side
    status: pending
  - id: provider-page
    content: 'Rewrite the provider dashboard page: hero band, payout warning, stat tiles, tabbed job feed, sticky payout/crew rail, open-jobs carousel, new skeleton'
    status: pending
  - id: provider-components
    content: 'Add provider _components: job-feed.tsx, provider-job-card.tsx, payout-summary.tsx, open-jobs-carousel.tsx, and formatCurrencyFromCents in utils.ts'
    status: pending
  - id: verify
    content: Lint, type check, build, and screenshot both dashboards in light/dark at desktop and mobile, checking for hydration warnings
    status: pending
isProject: false
---

# Dashboard UI rebuild

## Direction

Both dashboards get a full rebuild of their information architecture, not just a repaint. The visual language comes from the landing page, but motion is deliberately restrained since these are pages users open several times a day.

Reused from the landing page (all already in `apps/web/src/components/ui/`):

- `Counter` — count-up stat tiles, fires once on mount
- `GlowingEffect` — pointer-following border glow on cards (no idle loop)
- `SegmentedTabs` — `layoutId` pill for switching feeds
- `Carousel` — drag/snap horizontal rail for properties and open jobs
- `SectionEyebrow` from `@/components/landing/section-eyebrow`
- The hero's static glow recipe: `bg-[radial-gradient(ellipse_at_top,rgba(200,245,66,0.14),transparent_55%)]` + `bg-grid-fade` with a radial mask

Deliberately **not** used: `Spotlight`, `BackgroundBeams`, `MovingBorder`, `InfiniteMovingCards`. All loop forever and get tiring plus costly on a daily-use surface.

## 1. Shared dashboard design system

New folder `apps/web/src/components/dashboard/`:

- **`dashboard-hero.tsx`** — rounded-3xl header band with the static lime radial glow + grid mask, eyebrow, greeting `h1`, date line, optional status chips, and a slot for the primary CTA. Replaces both `GreetingSection` and the provider's inline header.
- **`stat-tiles.tsx`** — responsive grid of tiles. Each tile: label, `Counter` value (with optional `$`/`+` affix), sub-caption, icon in a `bg-brand-lime/10` chip, and a `GlowingEffect` border. Whole row does one staggered fade-up on mount via `motion.div`, then stays still.
- **`section-panel.tsx`** — consistent section chrome: title, count pill, right-aligned "View all" link, and the glass body `rounded-2xl border border-border bg-background/80 backdrop-blur-xl`.
- **`quick-actions.tsx`** — compact action rail (icon + label + arrow) with hover lift and lime border on hover.
- **`empty-state.tsx`** — single unified empty state (muted circular icon, title, copy, optional CTA), replacing the four near-identical copies across the two pages.

## 2. Customer dashboard

Rewrite [apps/web/src/app/(customer)/customer/page.tsx](<apps/web/src/app/(customer)/customer/page.tsx>).

**Data** — extend the existing `Promise.all` with two queries, each `.catch(() => [])` so a failure degrades one tile instead of blanking the page:

```ts
Promise.all([
  trpc.auth.me.query(),
  trpc.job.listForCustomer.query(),
  trpc.property.list.query(),
  trpc.subscription.listForCustomer.query().catch(() => []),
  trpc.payment.listForCustomer.query().catch(() => []),
]);
```

**New structure:**

1. **Hero band** — greeting, date, live chips ("2 bids waiting", "Next visit Thu"), lime pill CTA "Request a service".
2. **Stat tiles** — Active jobs · Bids to review · Properties · Active plans · Spent this year (sum `amountCents` on succeeded payments, `/100`).
3. **Two-column grid** `lg:grid-cols-[1.6fr_1fr]`:
   - Left: new `_components/job-feed.tsx` — a `SegmentedTabs` feed with Needs attention / Upcoming / Completed, cross-fading `JobCard` lists via `AnimatePresence`. This absorbs `needs-attention-section.tsx` and `upcoming-section.tsx`.
   - Right, `lg:sticky lg:top-28`: quick actions + the recent-activity timeline.
4. **Properties rail** — new `_components/property-carousel.tsx` using `Carousel`, with a trailing dashed "Add a property" tile.

**Component changes:**

- Retire `greeting-section.tsx`, `needs-attention-section.tsx`, `upcoming-section.tsx`, `property-section.tsx` (all dashboard-only; the grep confirms no other importers).
- Restyle `job-card.tsx` with the `GlowingEffect` border. Note this file is also imported by [apps/web/src/app/(customer)/customer/jobs/page.tsx](<apps/web/src/app/(customer)/customer/jobs/page.tsx>), so that list page inherits the upgrade — I'll spot-check it.
- Restyle `recent-activity-section.tsx` into a connector-line timeline inside `section-panel`.
- Restyle `first-property-prompt.tsx` to sit inside the hero band for the zero-property state.
- Replace the loading skeleton with one matching the new hero + tiles + two-column shape.

## 3. Provider dashboard

Rewrite [apps/web/src/app/(provider)/provider/page.tsx](<apps/web/src/app/(provider)/provider/page.tsx>).

**Data** — no aggregate endpoints exist, so every stat is derived client-side from list queries:

```ts
Promise.all([
  trpc.auth.me.query(),
  trpc.job.listForProvider.query({ status: 'PENDING' }),
  trpc.job.getUpcoming.query(),
  trpc.job.listOpen.query().catch(() => []),
  trpc.job.listMyBids.query().catch(() => []),
  trpc.crew.list.query().catch(() => []),
  trpc.payment.listForProvider.query().catch(() => []),
  trpc.connect.getStatus.query().catch(() => null),
]);
```

`payment.listForProvider` returns `Transfer[]` with `amountCents` — sum the succeeded ones for lifetime payout. `listMyBids` returns all bids, so filter `status === 'PENDING'` for the active count.

**New structure:**

1. **Hero band** — greeting + business name, date, chips, lime CTA "Browse open jobs".
2. **Payout warning** — keep the amber banner when `!payoutsEnabled`, restyled to the new panel chrome and moved directly under the hero.
3. **Stat tiles** — Open jobs near you · Bids out · Needs scheduling · Booked this week · Paid out (currency-formatted `Counter`).
4. **Two-column grid** `lg:grid-cols-[1.6fr_1fr]`:
   - Left: `_components/job-feed.tsx` — `SegmentedTabs` over Needs scheduling / Upcoming / Bids out. Job rows move into a shared `_components/provider-job-card.tsx` so the three tabs render consistently.
   - Right, sticky: `_components/payout-summary.tsx` (lifetime paid, last transfer, link to `/provider/payouts`) + crew roster summary from `crew.list` + quick actions.
5. **Open-jobs rail** — `_components/open-jobs-carousel.tsx` over `job.listOpen`, each card linking to `/provider/quotes` to bid. This is the biggest functional gain: today the dashboard never shows biddable work.

Extend `_components/utils.ts` with `formatCurrencyFromCents` for the payout figures.

## 4. Verification

- `ReadLints` on every touched file.
- Type check and build the web app the same way as the last round.
- Screenshot both dashboards in light and dark mode at desktop and mobile widths with the existing Playwright setup, and check the console for hydration warnings — `SegmentedTabs` and `Carousel` both caused hydration issues on the landing page previously.
