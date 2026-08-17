import type { ReactNode } from 'react';

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
      <span className="h-px w-6 bg-brand-lime" />
      {children}
    </p>
  );
}
