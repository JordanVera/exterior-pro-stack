'use client';

import { useCallback, useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import {
  PLAN_ASSUMPTIONS,
  PLAN_META,
  PLAN_SECTIONS,
  PLAN_UPDATED,
} from '@/content/business-plan';
import { LiveSnapshot } from './_components/live-snapshot';
import { PlanBlocks } from './_components/plan-blocks';
import { SectionNav } from './_components/section-nav';

export default function AdminBusinessPlanPage() {
  const [activeId, setActiveId] = useState(PLAN_SECTIONS[0]?.id ?? 'snapshot');

  useEffect(() => {
    const nodes = PLAN_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((node): node is HTMLElement => Boolean(node));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (id) setActiveId(id);
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.2, 0.5] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', `#${id}`);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && PLAN_SECTIONS.some((section) => section.id === hash)) {
      setActiveId(hash);
      document.getElementById(hash)?.scrollIntoView({ block: 'start' });
    }
  }, []);

  return (
    <div className="space-y-8 print:space-y-6">
      <DashboardHero
        eyebrow={PLAN_META.eyebrow}
        title={PLAN_META.title}
        subtitle={PLAN_META.subtitle}
        size="md"
        chips={[
          { id: 'updated', label: `Updated ${PLAN_UPDATED}`, tone: 'muted' },
          { id: 'audience', label: 'Internal operator', tone: 'lime' },
          { id: 'scope', label: 'View only', tone: 'muted' },
        ]}
        action={
          <Button
            variant="outline"
            className="print:hidden"
            onClick={() => window.print()}
          >
            <Printer />
            Print / PDF
          </Button>
        }
      />

      <SectionPanel title="Working assumptions">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {PLAN_ASSUMPTIONS.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 w-1 h-1 rounded-full shrink-0 bg-brand-lime" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </SectionPanel>

      <LiveSnapshot />

      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <SectionNav activeId={activeId} onSelect={scrollTo} />

        <div className="space-y-8 min-w-0">
          {PLAN_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-20"
            >
              <SectionPanel title={section.title}>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {section.summary}
                </p>
                <PlanBlocks blocks={section.blocks} />
              </SectionPanel>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
