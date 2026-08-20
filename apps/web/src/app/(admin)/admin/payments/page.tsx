'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { ExternalLink, Wallet } from 'lucide-react';
import { StatusBadge } from '../_components/status-badge';
import { dollars, formatDate } from '../_components/utils';

type View = 'payments' | 'payouts';
type KindFilter = 'all' | 'JOB' | 'SUBSCRIPTION';
type PaymentStatusFilter =
  | 'all'
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELED';
type TransferStatusFilter = 'all' | 'PENDING' | 'PAID' | 'FAILED' | 'REVERSED';

type PaymentRow = {
  id: string;
  kind: string;
  status: string;
  amountCents: number;
  platformFeeCents: number;
  transferAmountCents: number;
  receiptUrl: string | null;
  createdAt: string | Date;
  customer: { firstName: string; lastName: string; user: { email: string } };
  job: { service: { name: string } } | null;
  subscription: { plan: { name: string } } | null;
  transfers: { status: string; amountCents: number }[];
};

type TransferRow = {
  id: string;
  amountCents: number;
  status: string;
  createdAt: string | Date;
  provider: { businessName: string };
  payment: {
    kind: string;
    customer: { firstName: string; lastName: string };
    job: { service: { name: string } } | null;
  };
};

export default function AdminPaymentsPage() {
  const [view, setView] = useState<View>('payments');
  const [kind, setKind] = useState<KindFilter>('all');
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusFilter>('all');
  const [transferStatus, setTransferStatus] =
    useState<TransferStatusFilter>('all');

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paymentCursor, setPaymentCursor] = useState<string | undefined>();
  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [transferCursor, setTransferCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchPayments = (cursor?: string) => {
    setLoading(true);
    trpc.admin.listPayments
      .query({
        limit: 20,
        ...(kind !== 'all' ? { kind } : {}),
        ...(paymentStatus !== 'all' ? { status: paymentStatus } : {}),
        ...(cursor ? { cursor } : {}),
      })
      .then((data) => {
        setPayments(
          cursor
            ? [...payments, ...(data.items as PaymentRow[])]
            : (data.items as PaymentRow[]),
        );
        setPaymentCursor(data.nextCursor);
      })
      .catch((err) => toast.error(err.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  };

  const fetchTransfers = (cursor?: string) => {
    setLoading(true);
    trpc.admin.listTransfers
      .query({
        limit: 20,
        ...(transferStatus !== 'all' ? { status: transferStatus } : {}),
        ...(cursor ? { cursor } : {}),
      })
      .then((data) => {
        setTransfers(
          cursor
            ? [...transfers, ...(data.items as TransferRow[])]
            : (data.items as TransferRow[]),
        );
        setTransferCursor(data.nextCursor);
      })
      .catch((err) => toast.error(err.message || 'Failed to load payouts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (view === 'payments') fetchPayments();
    else fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, kind, paymentStatus, transferStatus]);

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Money"
        title="Payments"
        subtitle="Customer charges, platform fees, and provider transfers. Refunds stay in Stripe for now."
        size="md"
      />

      <FilterPills
        value={view}
        onChange={setView}
        options={[
          { value: 'payments', label: 'Payments' },
          { value: 'payouts', label: 'Payouts' },
        ]}
      />

      {view === 'payments' ? (
        <>
          <div className="flex flex-col gap-3">
            <FilterPills
              value={kind}
              onChange={setKind}
              options={[
                { value: 'all', label: 'All kinds' },
                { value: 'JOB', label: 'Jobs' },
                { value: 'SUBSCRIPTION', label: 'Subscriptions' },
              ]}
            />
            <FilterPills
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'SUCCEEDED', label: 'Succeeded' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'REFUNDED', label: 'Refunded' },
                { value: 'CANCELED', label: 'Canceled' },
              ]}
            />
          </div>

          <SectionPanel title="Charges" count={payments.length} bare>
            <div className="overflow-x-auto rounded-2xl border backdrop-blur-xl border-border bg-background/70">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      For
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Fee
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Transfer
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {payment.customer.firstName}{' '}
                          {payment.customer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.customer.user.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {payment.job?.service.name ||
                          payment.subscription?.plan.name ||
                          payment.kind}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {dollars(payment.amountCents)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {dollars(payment.platformFeeCents)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {dollars(payment.transferAmountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={payment.status} kind="payment" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex gap-1 items-center text-xs font-medium text-brand-navy hover:underline dark:text-brand-lime"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="w-full h-10" />
                  <Skeleton className="w-full h-10" />
                </div>
              ) : null}
              {!loading && payments.length === 0 ? (
                <EmptyState icon={Wallet} title="No payments found" />
              ) : null}
            </div>
          </SectionPanel>

          {paymentCursor ? (
            <Button
              variant="outline"
              onClick={() => fetchPayments(paymentCursor)}
            >
              Load more
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <FilterPills
            value={transferStatus}
            onChange={setTransferStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'PAID', label: 'Paid' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'REVERSED', label: 'Reversed' },
            ]}
          />

          <SectionPanel title="Provider payouts" count={transfers.length} bare>
            <div className="overflow-x-auto rounded-2xl border backdrop-blur-xl border-border bg-background/70">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Provider
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      For
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        {transfer.provider.businessName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {transfer.payment.job?.service.name ||
                          transfer.payment.kind}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {dollars(transfer.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={transfer.status} kind="transfer" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(transfer.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="w-full h-10" />
                  <Skeleton className="w-full h-10" />
                </div>
              ) : null}
              {!loading && transfers.length === 0 ? (
                <EmptyState icon={Wallet} title="No payouts found" />
              ) : null}
            </div>
          </SectionPanel>

          {transferCursor ? (
            <Button
              variant="outline"
              onClick={() => fetchTransfers(transferCursor)}
            >
              Load more
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
