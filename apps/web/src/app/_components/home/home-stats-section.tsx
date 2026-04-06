'use client';

const STATS = [
  { value: '9+', label: 'Service Categories' },
  { value: '24/7', label: 'Booking Available' },
  { value: '100%', label: 'Verified Providers' },
  { value: '3', label: 'Subscription Plans' },
] as const;

export function HomeStatsSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-5xl px-6 mx-auto">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
