import { getGreeting, getDateString } from './utils';
import { SectionEyebrow } from '@/components/landing/section-eyebrow';

interface GreetingSectionProps {
  firstName: string;
}

export function GreetingSection({ firstName }: GreetingSectionProps) {
  return (
    <section>
      <SectionEyebrow>Dashboard</SectionEyebrow>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{getDateString()}</p>
    </section>
  );
}
