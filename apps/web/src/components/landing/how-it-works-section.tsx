import { Timeline } from '@/components/ui/timeline';
import { HOW_IT_WORKS_STEPS } from './data';
import { SectionEyebrow } from './section-eyebrow';

export function HowItWorksSection() {
  const timeline = HOW_IT_WORKS_STEPS.map((step) => ({
    title: step.title,
    content: (
      <div className="p-6 rounded-2xl border backdrop-blur-sm border-border bg-card/60">
        <h4 className="text-xl font-semibold text-foreground">
          {step.heading}
        </h4>
        <p className="mt-3 text-muted-foreground">{step.body}</p>
      </div>
    ),
  }));

  return (
    <section id="how-it-works" className="py-8 scroll-mt-24 md:py-16">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-4 text-center md:mb-0 md:text-left">
          <SectionEyebrow>Simple process</SectionEyebrow>
        </div>
      </div>
      <Timeline
        data={timeline}
        title="Booked in minutes, done right"
        description="Whether you subscribe to a plan or post a one-time job, getting work done is fast and transparent."
      />
    </section>
  );
}
