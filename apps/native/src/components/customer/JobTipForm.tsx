import { useState } from 'react';
import { Alert, Linking, Pressable, Text, TextInput, View } from 'react-native';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/lib/theme';

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
      <Card>
        <Text className="mb-1 text-sm font-bold tracking-wider uppercase text-slate-400">
          Tip
        </Text>
        <Text className="text-base font-semibold text-white">
          You tipped {providerName} ${(existingCents / 100).toFixed(2)}
        </Text>
        <Text className="mt-1 text-sm text-slate-400">
          Tips go to the provider after processing fees.
        </Text>
      </Card>
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
      Alert.alert('Add a tip', 'Pick a tip of at least $1.');
      return;
    }

    try {
      setSending(true);
      const result = await trpc.payment.createTipCheckout.mutate({
        jobId,
        amountCents,
      });
      if (result.checkoutUrl) {
        Linking.openURL(result.checkoutUrl);
        return;
      }
      Alert.alert('Error', 'Could not start checkout.');
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Unable to send tip.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Text className="mb-1 text-sm font-bold tracking-wider uppercase text-slate-400">
        Tip
      </Text>
      <Text className="mb-1 text-base font-semibold text-white">
        Add a tip for {providerName}
      </Text>
      <Text className="mb-4 text-sm text-slate-400">
        Optional. Tips go to the provider after card processing fees.
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {PRESETS.map((dollars) => {
          const active = selected === dollars;
          return (
            <Pressable
              key={dollars}
              onPress={() => setSelected(dollars)}
              className={`rounded-full border px-4 py-2 ${
                active
                  ? 'border-brand-lime bg-brand-lime/20'
                  : 'border-line bg-surface-raised'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? 'text-brand-lime' : 'text-white'
                }`}
              >
                ${dollars}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setSelected('custom')}
          className={`rounded-full border px-4 py-2 ${
            selected === 'custom'
              ? 'border-brand-lime bg-brand-lime/20'
              : 'border-line bg-surface-raised'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              selected === 'custom' ? 'text-brand-lime' : 'text-white'
            }`}
          >
            Custom
          </Text>
        </Pressable>
      </View>

      {selected === 'custom' ? (
        <TextInput
          value={custom}
          onChangeText={setCustom}
          keyboardType="decimal-pad"
          placeholder="Amount in dollars"
          placeholderTextColor={colors.muted}
          className="mt-4 h-12 rounded-2xl border border-line bg-surface-sunken px-4 font-sans text-base text-white"
        />
      ) : null}

      <View className="mt-4">
        <PrimaryButton
          label={
            sending
              ? 'Opening checkout...'
              : valid
                ? `Tip $${(amountCents / 100).toFixed(2)}`
                : 'Tip $1 or more'
          }
          icon="heart"
          onPress={handleSend}
          loading={sending}
          disabled={!valid}
        />
      </View>
    </Card>
  );
}
