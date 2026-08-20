import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { loginPath } from '@/lib/auth-intent';
import { FAQS } from './data';
import { SectionEyebrow } from './section-eyebrow';

export function FaqSection() {
  return (
    <section id="faq" className="py-24 scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Questions, answered.
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Still not sure? Signing up takes an email address and about two
            minutes, and there is nothing to cancel if you change your mind.
          </p>
          <Link
            href={loginPath('customer')}
            className="inline-flex gap-2 items-center mt-6 text-sm font-semibold group text-brand-navy dark:text-brand-lime"
          >
            Get started free
            <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-base text-left hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
