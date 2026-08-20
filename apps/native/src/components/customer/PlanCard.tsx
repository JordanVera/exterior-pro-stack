import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { PressableCard } from '../ui/Card';
import { colors } from '@/lib/theme';

type PlanCardProps = {
  plan: {
    id: string;
    name: string;
    description: string | null;
    monthlyPriceCents: number;
    quarterlyPriceCents: number;
    annualPriceCents: number;
    services: Array<{
      id: string;
      frequency: string;
      service: { id: string; name: string };
    }>;
  };
  onPress: () => void;
  isSubscribed?: boolean;
};

export function PlanCard({ plan, onPress, isSubscribed }: PlanCardProps) {
  const monthlyPrice = (plan.monthlyPriceCents / 100).toFixed(0);

  return (
    <PressableCard
      onPress={onPress}
      className="mb-3"
      tone={isSubscribed ? 'accent' : 'default'}
    >
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-bold text-xl text-white">{plan.name}</Text>
          {plan.description ? (
            <Text className="mt-1 text-sm leading-5 text-slate-300">
              {plan.description}
            </Text>
          ) : null}
        </View>
        <View className="items-end">
          <Text className="font-bold text-2xl text-brand-lime">
            ${monthlyPrice}
          </Text>
          <Text className="text-xs text-slate-400">per month</Text>
        </View>
      </View>

      {isSubscribed ? (
        <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 p-2.5">
          <Ionicons name="checkmark-circle" size={16} color={colors.lime} />
          <Text className="flex-1 font-semibold text-xs text-brand-lime">
            Currently subscribed
          </Text>
        </View>
      ) : null}

      <View className="gap-2">
        <Text className="font-semibold text-xs uppercase tracking-wider text-slate-400">
          Included services
        </Text>
        {plan.services.map((ps) => (
          <View key={ps.id} className="flex-row items-center gap-2">
            <Ionicons name="checkmark" size={16} color={colors.lime} />
            <Text className="flex-1 text-sm text-slate-200">{ps.service.name}</Text>
          </View>
        ))}
      </View>
    </PressableCard>
  );
}
