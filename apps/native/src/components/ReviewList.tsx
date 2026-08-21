import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/StarRating';

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
    return (
      <Card>
        <Text className="text-sm text-slate-400">{empty}</Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {reviews.map((review) => (
        <Card key={review.id}>
          <StarRating value={review.rating} readOnly size={16} />
          <Text className="mt-2 text-base font-semibold text-white">
            {review.reviewerName}
          </Text>
          <Text className="mt-0.5 text-sm text-slate-400">
            {review.serviceName} ·{' '}
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          {review.comment ? (
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {review.comment}
            </Text>
          ) : null}
        </Card>
      ))}
    </View>
  );
}
