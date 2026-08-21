'use client';

import { cn } from '@/lib/utils';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { PLAN_SECTIONS } from '@/content/business-plan';

export function SectionNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
      <div className="print:hidden lg:hidden">
        <FilterPills
          value={activeId}
          onChange={onSelect}
          options={PLAN_SECTIONS.map((section) => ({
            value: section.id,
            label: section.navLabel,
          }))}
        />
      </div>

      <nav
        aria-label="Plan sections"
        className="hidden print:hidden lg:block"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Contents
        </p>
        <ul className="space-y-1">
          {PLAN_SECTIONS.map((section) => {
            const active = section.id === activeId;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelect(section.id);
                  }}
                  className={cn(
                    'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-brand-lime/15 font-medium text-brand-navy dark:text-brand-lime'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {section.navLabel}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
