import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { PrimaryButton } from '../PrimaryButton';
import { colors } from '@/lib/theme';

type BidCardProps = {
  bid: {
    id: string;
    priceCents: number;
    notes: string | null;
    status: string;
    createdAt: string | Date;
    provider: {
      id: string;
      businessName: string;
      phone: string;
    };
  };
  onAccept?: () => void;
  onDecline?: () => void;
  loading?: boolean;
};

export function BidCard({ bid, onAccept, onDecline, loading }: BidCardProps) {
  const price = (bid.priceCents / 100).toFixed(2);
  const createdDate = new Date(bid.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="mb-3">
      <View className="flex-row gap-3 justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-white">
            {bid.provider.businessName}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={13} color={colors.muted} />
            <Text className="text-sm text-slate-400">Bid on {createdDate}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-bold text-brand-lime">${price}</Text>
        </View>
      </View>

      {bid.notes ? (
        <View className="p-3 mb-3 rounded-xl border border-line bg-surface-sunken">
          <Text className="text-sm leading-5 text-slate-300">{bid.notes}</Text>
        </View>
      ) : null}

      {bid.status === 'PENDING' && onAccept && onDecline ? (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <PrimaryButton
              label="Accept & Pay"
              icon="checkmark"
              onPress={onAccept}
              loading={loading}
              variant="primary"
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              label="Decline"
              icon="close"
              onPress={onDecline}
              loading={loading}
              variant="secondary"
            />
          </View>
        </View>
      ) : bid.status === 'ACCEPTED' ? (
        <View className="flex-row gap-2 items-center p-3 rounded-xl border border-green-500/30 bg-green-500/10">
          <Ionicons name="checkmark-circle" size={18} color="#10b981" />
          <Text className="flex-1 text-sm font-medium text-green-200">
            Accepted
          </Text>
        </View>
      ) : bid.status === 'DECLINED' ? (
        <View className="flex-row gap-2 items-center p-3 rounded-xl border border-slate-500/30 bg-slate-500/10">
          <Ionicons name="close-circle" size={18} color="#94a3b8" />
          <Text className="flex-1 text-sm font-medium text-slate-300">
            Declined
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
