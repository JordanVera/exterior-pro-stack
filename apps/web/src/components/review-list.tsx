'use client';

import { StarRating } from '@/components/star-rating';

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  reviewerName: string;
  serviceName: string;
};

export function ReviewList({
  reviews,
  empty = 'No reviews yet.',
}: {
  reviews: PublicReview[];
  empty?: string;
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StarRating value={review.rating} readOnly size="sm" />
            <span className="text-sm font-semibold text-foreground">
              {review.reviewerName}
            </span>
            <span className="text-xs text-muted-foreground">
              {review.serviceName} ·{' '}
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {review.comment ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {review.comment}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
