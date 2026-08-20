import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Redirect, useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/Screen';
import { KenBurnsBackground } from '@/components/KenBurnsBackground';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isReady, isFieldUser, signIn, signOut } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isReady) return <LoadingScreen />;
  if (isFieldUser) return <Redirect href="/today" />;

  const digits = phone.replace(/\D/g, '').slice(0, 10);
  const fullPhone = `+1${digits}`;

  const sendCode = async () => {
    if (digits.length !== 10) {
      setError('Enter a 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await trpc.auth.sendCode.mutate({ phone: fullPhone });
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await trpc.auth.verifyCode.mutate({
        phone: fullPhone,
        code,
      });
      const me = await signIn(result.token);

      // Route based on role
      if (me.role === 'CUSTOMER') {
        router.replace('/home');
      } else if (me.role === 'PROVIDER' || me.role === 'CREW') {
        router.replace('/today');
      } else {
        await signOut();
        setError(
          'Unable to determine your account type. Please contact support.',
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid verification code',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-brand-night">
      <KenBurnsBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
            paddingTop: insets.top + 24,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(700)} className="px-6 pb-8">
            <Text className="mt-6 font-semibold text-xs uppercase tracking-[3px] text-brand-lime">
              Exterior Pro
            </Text>
            <Text className="mt-2 font-bold text-[40px] leading-[44px] text-white">
              {step === 'phone'
                ? 'Run your day\nfrom the truck.'
                : 'Check your\ntexts.'}
            </Text>
            <Text className="mt-3 text-[17px] leading-7 text-slate-300">
              {step === 'phone'
                ? 'Schedules, crews, and before-and-after photos for every job you win.'
                : `We sent a 6-digit code to +1 ${digits}.`}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(120)}
            className="p-5 mx-4 rounded-3xl border border-line-strong bg-surface/95"
          >
            {step === 'phone' ? (
              <>
                <Text className="mb-2 text-sm font-medium text-slate-300">
                  Phone number
                </Text>
                <View className="overflow-hidden flex-row rounded-2xl border border-line-strong bg-surface-sunken">
                  <View className="justify-center px-4 border-r border-line">
                    <Text className="text-lg text-slate-300">+1</Text>
                  </View>
                  <TextInput
                    value={digits}
                    onChangeText={(value) => setPhone(value.replace(/\D/g, ''))}
                    keyboardType="phone-pad"
                    placeholder="5551234567"
                    placeholderTextColor="#64748b"
                    className="flex-1 px-4 h-16 font-sans text-lg text-white"
                    returnKeyType="go"
                    onSubmitEditing={sendCode}
                    autoFocus
                  />
                </View>
                {error ? <ErrorLine message={error} /> : null}
                <View className="mt-4">
                  <PrimaryButton
                    label="Send code"
                    icon="arrow-forward"
                    onPress={sendCode}
                    loading={loading}
                  />
                </View>
                <Text className="mt-4 text-center text-[13px] leading-5 text-slate-400">
                  For homeowners, crews, and service providers.
                </Text>
              </>
            ) : (
              <>
                <Text className="mb-2 text-sm font-medium text-slate-300">
                  Verification code
                </Text>
                <TextInput
                  value={code}
                  onChangeText={(value) =>
                    setCode(value.replace(/\D/g, '').slice(0, 6))
                  }
                  keyboardType="number-pad"
                  placeholder="000000"
                  placeholderTextColor="#64748b"
                  className="h-16 rounded-2xl border border-line-strong bg-surface-sunken px-4 text-center font-semibold text-2xl tracking-[8px] text-white"
                  returnKeyType="go"
                  onSubmitEditing={verifyCode}
                  autoFocus
                />
                {error ? <ErrorLine message={error} /> : null}
                <View className="mt-4">
                  <PrimaryButton
                    label="Verify"
                    icon="checkmark"
                    onPress={verifyCode}
                    loading={loading}
                  />
                </View>
                <Pressable
                  onPress={() => {
                    setStep('phone');
                    setCode('');
                    setError('');
                  }}
                  className="items-center py-3 mt-3 active:opacity-70"
                >
                  <Text className="text-base font-semibold text-brand-lime">
                    Use a different number
                  </Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <View className="flex-row gap-2 items-start px-4 py-3 mt-3 rounded-2xl border border-red-500/30 bg-red-500/15">
      <Ionicons name="alert-circle" size={18} color="#f87171" />
      <Text className="flex-1 text-[15px] leading-6 text-red-200">
        {message}
      </Text>
    </View>
  );
}
