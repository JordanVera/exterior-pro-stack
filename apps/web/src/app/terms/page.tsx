import Link from "next/link";

export const metadata = { title: "Terms of Service — Exterior Pro" };

export default function TermsPage() {
  return (
    <main className="max-w-3xl px-5 py-16 mx-auto">
      <p className="mb-6 text-sm">
        <Link href="/" className="text-brand-navy hover:underline dark:text-brand-lime">
          ← Home
        </Link>
      </p>
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: August 16, 2026</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Exterior Pro
          website and related services (the &quot;Platform&quot;). By creating an account
          or using the Platform you agree to these Terms.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          The Platform
        </h2>
        <p>
          Exterior Pro connects property owners with independent exterior-service
          providers and also sells recurring service plans billed by Exterior Pro.
          Providers are independent contractors, not employees of Exterior Pro.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Accounts
        </h2>
        <p>
          You must provide accurate information and keep your phone number current.
          You are responsible for activity on your account.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Payments
        </h2>
        <p>
          One-time jobs are charged when you accept a bid. Subscription plans are
          billed on the cadence you select. Provider payouts are issued after work
          is marked complete, minus platform and processing fees. Refunds and
          disputes are handled by Exterior Pro as merchant of record.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Acceptable use
        </h2>
        <p>
          Do not use the Platform for unlawful work, misrepresentation of property
          conditions, or harassment of other users.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Disclaimer
        </h2>
        <p>
          Services are performed by independent providers. Exterior Pro does not
          guarantee workmanship beyond the tools we provide to schedule, pay, and
          communicate. These Terms are a launch draft and should be reviewed by
          counsel before production use.
        </p>
        <p>
          Questions:{" "}
          <a className="text-brand-navy hover:underline dark:text-brand-lime" href="mailto:support@exteriorpro.app">
            support@exteriorpro.app
          </a>
        </p>
      </div>
    </main>
  );
}
