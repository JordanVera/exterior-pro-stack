'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F3EBDD] text-[#0B1F33]">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0B1F33]/50">
            Exterior Pro
          </p>
          <h1 className="mt-3 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 max-w-md text-sm text-[#0B1F33]/70">
            We logged the error. Try again, or email support@exteriorpro.app if
            it keeps happening.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full bg-[#C8F542] px-5 py-2.5 text-sm font-semibold text-[#0A1208]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
