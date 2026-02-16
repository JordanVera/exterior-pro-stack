import { getGreeting, getDateString } from './utils';

interface GreetingSectionProps {
  firstName: string;
}

export function GreetingSection({ firstName }: GreetingSectionProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">{getDateString()}</p>
    </section>
  );
}
