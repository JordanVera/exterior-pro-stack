import Link from 'next/link';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@repo/validators';

export const metadata = { title: 'Contact — Exterior Pro' };

export default function ContactPage() {
  return (
    <main className="px-5 py-16 mx-auto max-w-3xl">
      <p className="mb-6 text-sm">
        <Link
          href="/"
          className="text-brand-navy hover:underline dark:text-brand-lime"
        >
          ← Home
        </Link>
      </p>
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-sm text-neutral-500">Greater Houston support</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p>
          Questions about a job, a plan, or a payout? Email{' '}
          <a
            className="text-brand-navy hover:underline dark:text-brand-lime"
            href={SUPPORT_MAILTO}
          >
            {SUPPORT_EMAIL}
          </a>
          . Include the email on the account so we can look it up.
        </p>
        <p>
          We currently serve Greater Houston. If you are outside the launch
          ZIP list, use the same inbox to join the waitlist.
        </p>
        <p>
          Refunds and disputes are handled by Exterior Pro as merchant of
          record. We will follow up from this inbox — do not pay a provider
          off-platform.
        </p>
      </div>
    </main>
  );
}
