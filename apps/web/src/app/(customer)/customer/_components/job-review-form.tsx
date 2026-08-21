'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/star-rating';

export type JobReviewValue = {
  rating: number;
  comment: string | null;
};

export function JobReviewForm({
  jobId,
  providerName,
  initial,
  onSaved,
}: {
  jobId: string;
  providerName: string;
  initial?: JobReviewValue | null;
  onSaved: (review: JobReviewValue) => void;
}) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const existing = Boolean(initial);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Pick a star rating first.');
      return;
    }

    setSaving(true);
    try {
      await trpc.job.submitReview.mutate({
        jobId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(existing ? 'Review updated' : 'Thanks for the review');
      onSaved({ rating, comment: comment.trim() || null });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save review',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          {existing
            ? `Your review of ${providerName}`
            : `How was ${providerName}?`}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ratings show on this provider&apos;s profile for other customers.
        </p>
      </div>

      <StarRating value={rating} onChange={setRating} size="lg" />

      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Tell others how the job went (optional)"
        className="resize-none rounded-xl"
      />

      <Button
        onClick={handleSubmit}
        disabled={saving || rating < 1}
        className="rounded-full font-semibold bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
      >
        {saving
          ? 'Saving…'
          : existing
            ? 'Update review'
            : 'Submit review'}
      </Button>
    </div>
  );
}
