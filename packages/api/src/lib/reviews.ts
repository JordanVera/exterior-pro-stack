import type { PrismaClient } from '@repo/db';

export type ProviderRating = {
  average: number | null;
  count: number;
};

export const EMPTY_RATING: ProviderRating = { average: null, count: 0 };

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewerName: string;
  serviceName: string;
};

export function publicReviewerName(firstName: string, lastName: string) {
  const last = lastName.trim();
  const initial = last ? ` ${last[0]!.toUpperCase()}.` : '';
  return `${firstName.trim()}${initial}`;
}

export function serializePublicReview(review: {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  customer: { firstName: string; lastName: string };
  job: { service: { name: string } };
}): PublicReview {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    reviewerName: publicReviewerName(
      review.customer.firstName,
      review.customer.lastName,
    ),
    serviceName: review.job.service.name,
  };
}

export async function getProviderRatingStats(
  db: PrismaClient,
  providerIds: string[],
): Promise<Map<string, ProviderRating>> {
  const stats = new Map<string, ProviderRating>();
  for (const id of providerIds) {
    stats.set(id, EMPTY_RATING);
  }

  const uniqueIds = Array.from(new Set(providerIds.filter(Boolean)));
  if (uniqueIds.length === 0) return stats;

  const grouped = await db.jobReview.groupBy({
    by: ['providerId'],
    where: { providerId: { in: uniqueIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  for (const row of grouped) {
    const raw = row._avg.rating;
    stats.set(row.providerId, {
      average: raw == null ? null : Math.round(raw * 10) / 10,
      count: row._count._all,
    });
  }

  return stats;
}

export async function listProviderReviews(
  db: PrismaClient,
  providerId: string,
  take = 20,
): Promise<PublicReview[]> {
  const reviews = await db.jobReview.findMany({
    where: { providerId },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      job: { select: { service: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return reviews.map(serializePublicReview);
}

export function ratingFor(
  stats: Map<string, ProviderRating>,
  providerId: string | undefined,
): ProviderRating {
  if (!providerId) return EMPTY_RATING;
  return stats.get(providerId) ?? EMPTY_RATING;
}

export function withRating<P extends { id: string }>(
  provider: P,
  stats: Map<string, ProviderRating>,
): P & { rating: ProviderRating } {
  return { ...provider, rating: ratingFor(stats, provider.id) };
}

export async function decorateCustomerJobs<
  T extends {
    acceptedBid: { provider: { id: string } } | null;
    bids: Array<{ provider: { id: string } }>;
  },
>(db: PrismaClient, jobs: T[]) {
  const ids = jobs.flatMap((job) => [
    ...(job.acceptedBid ? [job.acceptedBid.provider.id] : []),
    ...job.bids.map((bid) => bid.provider.id),
  ]);
  const stats = await getProviderRatingStats(db, ids);

  return jobs.map((job) => ({
    ...job,
    bids: job.bids.map((bid) => ({
      ...bid,
      provider: withRating(bid.provider, stats),
    })),
    acceptedBid: job.acceptedBid
      ? {
          ...job.acceptedBid,
          provider: withRating(job.acceptedBid.provider, stats),
        }
      : null,
  }));
}
