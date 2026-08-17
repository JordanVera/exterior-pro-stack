import Link from "next/link";

export const metadata = {
  title: "Independent Contractor Agreement — Exterior Pro",
};

export default function ContractorAgreementPage() {
  return (
    <main className="max-w-3xl px-5 py-16 mx-auto">
      <p className="mb-6 text-sm">
        <Link href="/" className="text-brand-navy hover:underline dark:text-brand-lime">
          ← Home
        </Link>
      </p>
      <h1 className="text-3xl font-bold">Independent Contractor Agreement</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: August 16, 2026</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p>
          By enabling payouts you confirm that you are an independent contractor,
          not an employee or partner of Exterior Pro. You control how, when, and
          with which crew you perform accepted jobs.
        </p>
        <p>
          You are responsible for licenses, insurance, equipment, taxes (including
          1099 reporting), and the quality of work performed. Exterior Pro provides
          software, customer checkout, and payout infrastructure, and may withhold
          or reverse payouts for refunds, disputes, or incomplete work.
        </p>
        <p>
          You agree not to solicit Platform customers to pay you off-platform for
          jobs originated here. This agreement is a launch draft and should be
          reviewed by counsel before production use.
        </p>
      </div>
    </main>
  );
}
