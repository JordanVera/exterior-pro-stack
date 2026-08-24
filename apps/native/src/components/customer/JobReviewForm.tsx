import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StarRating } from '@/components/StarRating';
import { colors } from '@/lib/theme';

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
      Alert.alert('Pick a rating', 'Tap a star before submitting your review.');
      return;
    }

    try {
      setSaving(true);
      await trpc.job.submitReview.mutate({
        jobId,
        rating,
        comment: comment.trim() || undefined,
      });
      onSaved({ rating, comment: comment.trim() || null });
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Unable to save review.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Text className="mb-1 text-lg font-semibold text-white">Review</Text>
      <Text className="mb-3 text-base font-semibold text-white">
        {existing ? `Your review of ${providerName}` : `How was ${providerName}?`}
      </Text>
      <StarRating value={rating} onChange={setRating} size={28} />
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Tell others how the job went (optional)"
        placeholderTextColor={colors.muted}
        multiline
        maxLength={2000}
        className="mt-4 max-h-32 min-h-[88px] rounded-2xl border border-line bg-surface-sunken px-4 py-3 font-sans text-base text-white"
      />
      <View className="mt-4">
        <PrimaryButton
          label={
            saving ? 'Saving...' : existing ? 'Update review' : 'Submit review'
          }
          icon="star"
          onPress={handleSubmit}
          loading={saving}
          disabled={rating < 1}
        />
      </View>
    </Card>
  );
}
