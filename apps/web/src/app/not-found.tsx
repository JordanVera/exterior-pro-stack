import Link from 'next/link';
import { SUPPORT_MAILTO } from '@repo/validators';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        That link does not exist. Head home, or email support if you think
        something is broken.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-lime px-5 py-2.5 text-sm font-semibold text-brand-ink"
        >
          Back home
        </Link>
        <a
          href={SUPPORT_MAILTO}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          Contact support
        </a>
      </div>
    </main>
  );
}
