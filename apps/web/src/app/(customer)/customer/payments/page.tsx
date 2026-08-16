'use client';

import { useEffect, useState } from 'react';
import { trpc } from '../../../../lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Receipt } from 'lucide-react';

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpc.payment.listForCustomer
      .query()
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-40 h-8" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-neutral-500">Receipts for jobs and plans</p>
      </div>

      {payments.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-12 text-center">
            <Receipt className="mx-auto mb-3 w-10 h-10 text-neutral-400" />
            <p className="text-sm text-neutral-500">No payments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="shadow-none">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <div className="text-sm font-medium">
                    {p.job?.service?.name ||
                      p.subscription?.plan?.name ||
                      (p.kind === 'SUBSCRIPTION' ? 'Subscription' : 'Job')}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(p.createdAt).toLocaleDateString()} · {p.kind}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-sm font-semibold">
                    {dollars(p.amountCents)}
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {p.status}
                  </Badge>
                  {p.receiptUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={p.receiptUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
