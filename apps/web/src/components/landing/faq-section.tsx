import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQS } from './data';
import { SectionEyebrow } from './section-eyebrow';

export function FaqSection() {
  return (
    <section className="py-24">
      <div className="px-6 mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Questions, answered
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
