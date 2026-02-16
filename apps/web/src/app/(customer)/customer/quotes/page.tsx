'use client';

import { useEffect, useState } from 'react';
import { trpc } from '../../../../lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING:
    'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300',
  SENT: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  ACCEPTED:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = () => {
    trpc.quote.listForCustomer
      .query()
      .then(setQuotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleAccept = async (quoteId: string) => {
    try {
      await trpc.quote.updateStatus.mutate({ quoteId, status: 'ACCEPTED' });
      fetchQuotes();
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote');
    }
  };

  const handleDecline = async (quoteId: string) => {
    if (!confirm('Are you sure you want to decline this quote?')) return;
    try {
      await trpc.quote.updateStatus.mutate({ quoteId, status: 'DECLINED' });
      fetchQuotes();
    } catch (err: any) {
      alert(err.message || 'Failed to decline quote');
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading quotes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          My Quotes
        </h2>
        <p className="text-muted-foreground mt-1">
          View and manage your service quotes
        </p>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      {quote.service.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={cn('border-0', statusColors[quote.status] || '')}
                    >
                      {quote.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quote.service.category.name} &middot;{' '}
                    {quote.property.address}, {quote.property.city}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Provider: {quote.provider.businessName}
                  </p>
                  {quote.customerNotes && (
                    <p className="text-sm text-muted-foreground/80 mt-1">
                      Your notes: {quote.customerNotes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {quote.customPrice && (
                    <div className="text-xl font-bold text-foreground">
                      ${Number(quote.customPrice).toFixed(2)}
                    </div>
                  )}
                  {!quote.customPrice && (
                    <div className="text-sm text-muted-foreground">
                      Base: ${Number(quote.service.basePrice).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {quote.notes && (
                <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                  Provider notes: {quote.notes}
                </div>
              )}

              {quote.status === 'SENT' && (
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(quote.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept Quote
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(quote.id)}
                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    Decline
                  </Button>
                </div>
              )}

              {quote.job && (
                <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg text-sm text-cyan-700 dark:text-cyan-400">
                  Job Status: {quote.job.status.replace('_', ' ')}
                  {quote.job.scheduledDate &&
                    ` · Scheduled: ${new Date(quote.job.scheduledDate).toLocaleDateString()}`}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {quotes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No quotes yet.</p>
            <p className="text-sm mt-1">
              Browse services to request your first quote!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
