'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PRESETS = [5, 10, 15, 20];

export function JobTipForm({
  jobId,
  providerName,
  existingCents,
}: {
  jobId: string;
  providerName: string;
  existingCents?: number | null;
}) {
  const [selected, setSelected] = useState<number | 'custom' | null>(10);
  const [custom, setCustom] = useState('');
  const [sending, setSending] = useState(false);

  if (existingCents && existingCents > 0) {
    return (
      <div>
        <p className="text-sm font-medium text-foreground">
          You tipped {providerName} ${(existingCents / 100).toFixed(2)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Tips go to the provider after processing fees.
        </p>
      </div>
    );
  }

  const amountCents =
    selected === 'custom'
      ? Math.round(Number.parseFloat(custom || '0') * 100)
      : selected
        ? selected * 100
        : 0;
  const valid = Number.isFinite(amountCents) && amountCents >= 100;

  const handleSend = async () => {
    if (!valid) {
      toast.error('Pick a tip of at least $1.');
      return;
    }

    setSending(true);
    try {
      const result = await trpc.payment.createTipCheckout.mutate({
        jobId,
        amountCents,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      toast.error('Could not start checkout');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send tip');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          Add a tip for {providerName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Optional. Tips go to the provider after card processing fees.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((dollars) => (
          <Button
            key={dollars}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelected(dollars)}
            className={cn(
              'h-9 rounded-full px-4',
              selected === dollars &&
                'border-brand-lime bg-brand-lime/15 text-brand-ink dark:text-brand-lime',
            )}
          >
            ${dollars}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSelected('custom')}
          className={cn(
            'h-9 rounded-full px-4',
            selected === 'custom' &&
              'border-brand-lime bg-brand-lime/15 text-brand-ink dark:text-brand-lime',
          )}
        >
          Custom
        </Button>
      </div>

      {selected === 'custom' ? (
        <div className="relative max-w-40">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={1}
            max={500}
            step="1"
            inputMode="decimal"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="0"
            className="rounded-xl pl-7"
          />
        </div>
      ) : null}

      <Button
        onClick={handleSend}
        disabled={sending || !valid}
        className="rounded-full font-semibold bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
      >
        {sending
          ? 'Opening checkout…'
          : valid
            ? `Tip $${(amountCents / 100).toFixed(2)}`
            : 'Tip $1 or more'}
      </Button>
    </div>
  );
}
