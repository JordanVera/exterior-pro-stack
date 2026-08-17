import { TRUST_ITEMS } from './data';

export function TrustStrip() {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <div key={item.value}>
            <div className="text-2xl font-bold tracking-tight text-brand-navy dark:text-brand-lime sm:text-3xl">
              {item.value}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
