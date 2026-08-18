---
name: Native field app redesign
overview: 'Rebuild the visual language of the Expo field app for providers and crews: add Outfit typography, a small native design system mirroring the web work, and restyle all four screens with field-first contrast and touch targets, plus six selected functionality additions.'
todos:
  - id: fonts
    content: Add expo-font and @expo-google-fonts/outfit, load Outfit in root layout with splash hold, register per-weight families in tailwind.config.js, and sync theme.ts tokens
    status: completed
  - id: ui-kit
    content: 'Build apps/native/src/components/ui/: ScreenHeader, StatTiles, SectionPanel, FilterPills, Chip, Card, BottomSheet, IconButton, StickyActionBar'
    status: completed
  - id: upgrade-existing
    content: Upgrade JobCard, StatusBadge, PrimaryButton, EmptyState to the new token and typography system
    status: completed
  - id: today
    content: 'Rebuild Today: ScreenHeader, role-aware StatTiles band, Up next hero card, remaining jobs, pull-to-refresh'
    status: in_progress
  - id: jobs-list
    content: "Rebuild Jobs list: ScreenHeader, FilterPills over view:'all' including completed history, pull-to-refresh"
    status: pending
  - id: job-detail
    content: Restructure job detail into sections, paired Navigate/Call icon buttons, StickyActionBar for the primary action
    status: pending
  - id: unassign-api
    content: Add job.unassignCrew provider procedure and wire Change/Remove crew in the job detail bottom sheet
    status: pending
  - id: reschedule
    content: Allow rescheduling for SCHEDULED jobs (not just PENDING), pre-selecting the current date and time
    status: pending
  - id: account-login
    content: Rebuild Account with profile card and crew roster, restyle login, refine tab bar chrome
    status: pending
  - id: verify
    content: Type check and capture simulator screenshots of all four screens in both provider and crew roles
    status: pending
isProject: false
---

# Native Field App Redesign (Provider + Crew)

## Direction

Hybrid: the web's brand identity (Outfit typography, lime accents, card language, section rhythm) with field-first ergonomics. Explicitly **no** frosted glass, backdrop blur, or glow borders — those wash out in direct sunlight, which is where this app is used. Larger base type, higher-contrast secondary text, and bigger touch targets throughout.

Brand hex values already match web exactly (`#C8F542` lime, `#0B1F33` navy, `#070B12` night), so no palette migration is needed.

## Scope

Four screens plus login, all under `apps/native/app/(field)/` and `(auth)/`. `PROVIDER` and `CREW` share these routes; role differences stay as conditional sections rather than new route groups.

---

## 1. Foundation: typography and tokens

Add `expo-font` and `@expo-google-fonts/outfit`, load in [apps/native/app/\_layout.tsx](apps/native/app/_layout.tsx) and hold the splash until fonts resolve.

**Gotcha to handle:** React Native does not synthesize weights for custom fonts, so Tailwind's `font-bold` will not automatically pick Outfit Bold. Each weight must be registered as its own family in [apps/native/tailwind.config.js](apps/native/tailwind.config.js):

```js
fontFamily: {
  sans: ['Outfit_400Regular'],
  medium: ['Outfit_500Medium'],
  semibold: ['Outfit_600SemiBold'],
  bold: ['Outfit_700Bold'],
}
```

Existing `font-bold`/`font-semibold` usages across screens get swapped to these classes.

Extend the theme with surface and border tokens (currently every card repeats `border-white/10 bg-navy-800`), and keep [apps/native/src/lib/theme.ts](apps/native/src/lib/theme.ts) in sync — it carries an explicit "keep hex values in sync" comment.

## 2. Native design system

New directory `apps/native/src/components/ui/`, mirroring the web primitives:

- `ScreenHeader` — eyebrow, title, subtitle, optional right slot (the `DashboardHero` analog)
- `StatTiles` — 2-up grid of tiles with icon, value, label
- `SectionPanel` — titled section with count and optional action
- `FilterPills` — horizontally scrollable status pills
- `Chip` — selectable pill for schedule day/time
- `Card` — base surface, replaces the repeated border/bg string
- `BottomSheet` — extracted from the inline assign-crew `Modal`
- `IconButton` — for side-by-side Navigate/Call
- `StickyActionBar` — pinned bottom bar for the job's primary action

Upgrade the five existing components in [apps/native/src/components/](apps/native/src/components/): `JobCard` gains an icon and a status color rail, `StatusBadge` gets higher contrast, `PrimaryButton` gains an icon slot, `EmptyState` gains an optional action.

## 3. Screens

### Today — [apps/native/app/(field)/today.tsx](<apps/native/app/(field)/today.tsx>)

Currently a greeting plus a flat list. Becomes: `ScreenHeader`, then a `StatTiles` band, then an "Up next" hero card for the next scheduled job with inline Navigate, then the remaining jobs.

Stats derive client-side from one `job.listMine({ view: 'all' })` call — no API work:

- Provider: Today / Unscheduled / Needs crew / In progress
- Crew: Today / In progress / Done this week

### Jobs — [apps/native/app/(field)/jobs/index.tsx](<apps/native/app/(field)/jobs/index.tsx>)

`ScreenHeader` plus `FilterPills` (All / Needs schedule / Scheduled / In progress / Completed). Switching to `view: 'all'` and filtering client-side delivers both the filtering and the completed-jobs history in one change.

### Job detail — [apps/native/app/(field)/jobs/[id].tsx](<apps/native/app/(field)/jobs/[id].tsx>)

The messiest screen: 317 lines with schedule picker, crew modal, photos, and status actions all inlined. Restructure into a header block, a property card with Navigate/Call as paired icon buttons, notes, then provider-only Schedule and Crew sections, then photos.

The primary action moves out of the scroll flow into `StickyActionBar`.

### Account — [apps/native/app/(field)/account.tsx](<apps/native/app/(field)/account.tsx>)

`ScreenHeader`, profile card with an initials avatar, a crew roster for providers via `trpc.crew.list`, and the sign-out button.

### Login and chrome

Light restyle of [apps/native/app/(auth)/login.tsx](<apps/native/app/(auth)/login.tsx>) for consistency, plus tab bar refinement in [apps/native/app/(field)/\_layout.tsx](<apps/native/app/(field)/_layout.tsx>) with filled icons on the active tab.

---

## 4. Functionality additions

Five of the six need no backend work:

- **Pull-to-refresh** — `RefreshControl` on Today and Jobs, tinted lime
- **Sticky action bar** — moves "Mark complete" above the fold
- **Filter pills** — client-side over `view: 'all'`
- **Completed history** — same query, a filter value
- **Reschedule** — `job.schedule` has no status guard, so this is purely removing the client-side `job.status === "PENDING"` condition. Gate to PENDING and SCHEDULED only: the mutation force-sets `status: 'SCHEDULED'`, so exposing it on an in-progress job would silently knock it backwards.

### The one backend change: crew reassignment

`job.assignCrew` in [packages/api/src/routers/job.ts](packages/api/src/routers/job.ts) always creates:

```js
return ctx.db.jobAssignment.create({
  data: { jobId: input.jobId, crewId: input.crewId },
```

With `@@unique([jobId, crewId])` on the model, re-assigning the same crew throws a raw Prisma error into an `Alert`, and assigning a different crew attaches a second crew rather than replacing. Add a `job.unassignCrew` provider procedure that verifies job ownership and deletes the assignment; "Change crew" then becomes unassign-then-assign. This also fixes the existing double-assignment bug.

---

## 5. Verification

Type check the native app, then run it in the iOS simulator via `npx expo start --ios` to capture before/after screenshots of all four screens in both roles. If the simulator is unavailable I will fall back to type checking plus a careful read-through, and will say so rather than claiming visual confirmation.
