import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Exterior Pro' };

export default function PrivacyPage() {
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
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Last updated: August 16, 2026
      </p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p>
          Exterior Pro collects the information needed to operate a
          property-services marketplace: phone number, name, email, property
          addresses, job details, payment records, and device push tokens.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          How we use it
        </h2>
        <p>
          We use this data to authenticate you, match jobs with providers,
          process payments through Stripe, send email (and optional SMS) about
          jobs, and improve the product. We do not sell personal information.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Processors
        </h2>
        <p>
          Payment data is processed by Stripe. Login codes and email are sent
          via Brevo. Job SMS may be sent via Twilio when a phone number is on
          file. Hosting and logs may be processed by Vercel.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Retention
        </h2>
        <p>
          We retain account, job, and payment records as required for tax,
          dispute, and operational purposes. You may request deletion of your
          account by contacting support, subject to legal retention needs.
        </p>
        <p>
          This policy is a launch draft and should be reviewed by counsel before
          production use. Contact{' '}
          <a
            className="text-brand-navy hover:underline dark:text-brand-lime"
            href="mailto:support@exteriorpro.app"
          >
            support@exteriorpro.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
