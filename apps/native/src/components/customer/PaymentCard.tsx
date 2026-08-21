import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '@/lib/theme';

type PaymentCardProps = {
  payment: {
    id: string;
    kind?: string;
    amountCents: number;
    status: string;
    createdAt: string | Date;
    receiptUrl: string | null;
    job?: {
      id: string;
      service: { name: string };
      property: { address: string };
    } | null;
    subscription?: {
      id: string;
      plan: { name: string };
    } | null;
  };
};

export function PaymentCard({ payment }: PaymentCardProps) {
  const amount = (payment.amountCents / 100).toFixed(2);
  const date = new Date(payment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusBadge =
    payment.status === 'SUCCEEDED'
      ? { bg: 'bg-green-500/30', text: 'text-green-200', label: 'Paid' }
      : payment.status === 'PENDING'
        ? { bg: 'bg-yellow-500/30', text: 'text-yellow-200', label: 'Pending' }
        : { bg: 'bg-slate-500/30', text: 'text-slate-200', label: payment.status };

  const title =
    payment.kind === 'TIP'
      ? payment.job
        ? `Tip · ${payment.job.service.name}`
        : 'Tip'
      : payment.job
        ? payment.job.service.name
        : payment.subscription
          ? payment.subscription.plan.name
          : 'Payment';

  const subtitle = payment.job
    ? payment.job.property.address
    : payment.subscription
      ? 'Subscription payment'
      : date;

  return (
    <Card className="mb-3">
      <View className="mb-2 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-semibold text-base text-white">{title}</Text>
          <Text className="mt-0.5 text-sm text-slate-400" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-bold text-xl text-white">${amount}</Text>
          <View
            className={`mt-1 rounded-full px-2.5 py-0.5 ${statusBadge.bg}`}
          >
            <Text className={`font-semibold text-[11px] ${statusBadge.text}`}>
              {statusBadge.label}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Ionicons name="calendar-outline" size={13} color={colors.muted} />
        <Text className="text-sm text-slate-400">{date}</Text>
      </View>

      {payment.receiptUrl ? (
        <Pressable
          onPress={() => Linking.openURL(payment.receiptUrl!)}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-line bg-surface-raised py-2.5 active:opacity-70"
        >
          <Ionicons name="receipt-outline" size={16} color={colors.lime} />
          <Text className="font-semibold text-sm text-brand-lime">
            View receipt
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}
