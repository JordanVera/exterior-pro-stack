import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen, Screen } from '@/components/Screen';

export default function LoginScreen() {
  const router = useRouter();
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
      if (me.role !== 'PROVIDER' && me.role !== 'CREW') {
        await signOut();
        setError(
          'This app is for crews and providers. Ask your owner to add your phone to a crew.',
        );
        return;
      }
      router.replace('/today');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid verification code',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 px-5 pt-8"
      >
        <Text className="text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          Exterior Pro
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">
          {step === 'phone' ? 'Sign in' : 'Check your texts'}
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-400">
          {step === 'phone'
            ? 'Use the phone number on your crew or provider account.'
            : `We sent a 6-digit code to +1 ${digits}.`}
        </Text>

        {step === 'phone' ? (
          <View className="mt-8">
            <Text className="mb-2 text-sm font-medium text-slate-300">
              Phone number
            </Text>
            <View className="overflow-hidden flex-row rounded-2xl border border-white/15 bg-navy-800">
              <View className="justify-center px-4 border-r border-white/10">
                <Text className="text-lg text-slate-300">+1</Text>
              </View>
              <TextInput
                value={digits}
                onChangeText={(value) => setPhone(value.replace(/\D/g, ''))}
                keyboardType="phone-pad"
                placeholder="5551234567"
                placeholderTextColor="#64748b"
                className="flex-1 px-4 h-14 text-lg text-white"
                autoFocus
              />
            </View>
            {error ? (
              <Text className="mt-3 text-base text-red-400">{error}</Text>
            ) : null}
            <View className="mt-6">
              <PrimaryButton
                label="Send code"
                onPress={sendCode}
                loading={loading}
              />
            </View>
          </View>
        ) : (
          <View className="mt-8">
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
              className="h-14 rounded-2xl border border-white/15 bg-navy-800 px-4 text-center text-2xl tracking-[8px] text-white"
              autoFocus
            />
            {error ? (
              <Text className="mt-3 text-base text-red-400">{error}</Text>
            ) : null}
            <View className="mt-6">
              <PrimaryButton
                label="Verify"
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
              className="items-center py-3 mt-4"
            >
              <Text className="text-base text-cyan-400">
                Use a different number
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
