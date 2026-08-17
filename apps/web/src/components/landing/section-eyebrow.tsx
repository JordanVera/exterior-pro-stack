import type { ReactNode } from 'react';

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
      <span className="w-6 h-px bg-cyan-500" />
      {children}
    </p>
  );
}
