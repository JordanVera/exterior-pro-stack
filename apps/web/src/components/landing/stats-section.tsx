import { STATS } from './data';

export function StatsSection() {
  return (
    <section className="py-16">
      <div className="grid grid-cols-2 gap-8 px-6 mx-auto max-w-5xl text-center md:grid-cols-4">
        {STATS.map((stat) => (
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
  );
}
