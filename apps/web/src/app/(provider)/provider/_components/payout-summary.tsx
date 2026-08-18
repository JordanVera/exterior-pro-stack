'use client';

import Link from 'next/link';
import { ArrowUpRight, Wallet } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { formatCurrencyFromCents, formatJobDate } from './utils';

export type ProviderTransfer = {
  id: string;
  amountCents: number;
  status: string;
  createdAt: string | Date;
  payment?: { job?: { service?: { name: string } | null } | null } | null;
};

export function PayoutSummary({
  transfers,
  payoutsEnabled,
}: {
  transfers: ProviderTransfer[];
  payoutsEnabled: boolean;
}) {
  const paid = transfers.filter((t) => t.status === 'PAID');
  const lifetimeCents = paid.reduce((total, t) => total + t.amountCents, 0);
  const pendingCents = transfers
    .filter((t) => t.status === 'PENDING')
    .reduce((total, t) => total + t.amountCents, 0);
  const last = paid[0];

  return (
    <SectionPanel
      title="Payouts"
      viewAll={{ href: '/provider/payouts', label: 'Manage' }}
      bare
    >
      <div className="overflow-hidden relative p-5 rounded-2xl border backdrop-blur-xl border-border bg-background/70">
        <GlowingEffect
          disabled={false}
          glow
          proximity={72}
          spread={28}
          borderWidth={2}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,245,66,0.12),transparent_60%)]" />

        <div className="relative">
          <div className="flex gap-3 justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Paid out to date
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {formatCurrencyFromCents(lifetimeCents, { compact: true })}
              </p>
            </div>
            <span className="flex justify-center items-center w-9 h-9 rounded-lg border shrink-0 border-brand-lime/25 bg-brand-lime/10">
              <Wallet className="w-4 h-4 text-brand-lime" />
            </span>
          </div>

          <dl className="pt-4 mt-5 space-y-2 text-xs border-t border-border">
            <div className="flex gap-3 justify-between items-center">
              <dt className="text-muted-foreground">In transit</dt>
              <dd className="font-semibold text-foreground">
                {formatCurrencyFromCents(pendingCents)}
              </dd>
            </div>
            <div className="flex gap-3 justify-between items-center">
              <dt className="text-muted-foreground">Last payout</dt>
              <dd className="font-semibold truncate text-foreground">
                {last
                  ? `${formatCurrencyFromCents(last.amountCents)} · ${formatJobDate(last.createdAt)}`
                  : 'None yet'}
              </dd>
            </div>
            <div className="flex gap-3 justify-between items-center">
              <dt className="text-muted-foreground">Status</dt>
              <dd
                className={
                  payoutsEnabled
                    ? 'font-semibold text-green-500'
                    : 'font-semibold text-amber-500'
                }
              >
                {payoutsEnabled ? 'Enabled' : 'Setup needed'}
              </dd>
            </div>
          </dl>

          <Link
            href="/provider/payouts"
            className="inline-flex gap-1 items-center mt-4 text-xs font-semibold transition-colors text-brand-navy hover:text-brand-navy/70 dark:text-brand-lime dark:hover:text-brand-lime/80"
          >
            View payout history
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </SectionPanel>
  );
}
