'use client';

const STATS = [
  { value: '9+', label: 'Service Categories' },
  { value: '24/7', label: 'Booking Available' },
  { value: '100%', label: 'Verified Providers' },
  { value: '3', label: 'Subscription Plans' },
] as const;

export function HomeStatsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.25rem] border border-black/[0.06] bg-white/70 py-8 text-center shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03]"
            >
              <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 px-2 text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
