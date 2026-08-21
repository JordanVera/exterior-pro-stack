import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/lib/theme';
import { StatusBadge } from '../StatusBadge';
import { formatAddress, serviceIcon } from '@/lib/utils';

type JobCardProps = {
  job: {
    id: string;
    status: string;
    createdAt: string | Date;
    service: { name: string };
    property: { address: string; city: string; state: string; zip: string };
    bids?: Array<{ id: string; status: string }>;
    review?: { id: string } | null;
  };
  onPress: () => void;
};

export function CustomerJobCard({ job, onPress }: JobCardProps) {
  const pendingBids =
    job.bids?.filter((b) => b.status === 'PENDING').length || 0;
  const createdDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden mb-3 rounded-2xl border border-line bg-surface active:opacity-80"
    >
      <View className="p-4">
        <View className="flex-row gap-3 justify-between items-start mb-2">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07]">
              <Ionicons
                name={serviceIcon(job.service.name)}
                size={18}
                color={colors.lime}
              />
            </View>
            <Text className="flex-1 font-semibold text-[17px] text-white">
              {job.service.name}
            </Text>
          </View>
          <StatusBadge status={job.status} size="sm" />
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={14} color={colors.muted} />
          <Text className="text-[15px] text-slate-200">{createdDate}</Text>
        </View>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text className="flex-1 text-sm text-slate-400" numberOfLines={1}>
            {formatAddress(job.property)}
          </Text>
        </View>
        {pendingBids > 0 && job.status === 'OPEN' ? (
          <View className="mt-2 flex-row items-center gap-1.5">
            <Ionicons name="pricetag" size={14} color={colors.lime} />
            <Text className="text-sm font-medium text-brand-lime">
              {pendingBids} bid{pendingBids > 1 ? 's' : ''} to review
            </Text>
          </View>
        ) : job.status === 'COMPLETED' && !job.review ? (
          <View className="mt-2 flex-row items-center gap-1.5">
            <Ionicons name="star" size={14} color={colors.lime} />
            <Text className="text-sm font-medium text-brand-lime">
              Leave a review
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
