import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { OtpInput } from 'react-native-otp-entry';
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
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isReady) return <LoadingScreen />;
  if (isFieldUser) return <Redirect href="/today" />;

  const normalizedEmail = email.trim().toLowerCase();

  const sendCode = async () => {
    if (!normalizedEmail.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await trpc.auth.sendCode.mutate({ email: normalizedEmail });
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (codeOverride?: string) => {
    const otp = codeOverride ?? code;
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await trpc.auth.verifyCode.mutate({
        email: normalizedEmail,
        code: otp,
      });
      const me = await signIn(result.token);

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
            paddingBottom: Math.max(insets.bottom, 24),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.duration(550)}
            className="px-4 pt-6"
          >
            {/* Logo */}
            {/* <View className="items-center mb-6">
              <Image
                source={require('../../assets/logo-stacked-lime.png')}
                style={{ width: 100, height: 38 }}
                resizeMode="contain"
              />
            </View> */}

            {/* Form card */}
            <View
              className="overflow-hidden rounded-3xl"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.14)',
              }}
            >
              <View style={{ height: 3, backgroundColor: colors.lime }} />

              <View className="p-5 bg-surface-raised">
                <Animated.View key={step} entering={FadeInDown.duration(300)}>
                  <View className="items-center my-4">
                    <Image
                      source={require('../../assets/logo-stacked-lime.png')}
                      style={{ width: 160, height: 50 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="mb-1 text-xl font-bold text-white">
                    {step === 'email' ? 'Sign in' : 'Check your email'}
                  </Text>
                  <Text className="mb-5 text-sm leading-5 text-white/55">
                    {step === 'email'
                      ? "Enter your email and we'll send a 6-digit code."
                      : `Code sent to ${normalizedEmail}`}
                  </Text>

                  {step === 'email' ? (
                    <>
                      <Text className="mb-2 text-sm font-semibold text-white/70">
                        Email address
                      </Text>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        placeholder="you@company.com"
                        placeholderTextColor="rgba(255,255,255,0.28)"
                        className="px-4 h-[52px] text-base text-white rounded-2xl border border-line-strong bg-surface-sunken"
                        returnKeyType="go"
                        onSubmitEditing={sendCode}
                        autoFocus
                      />
                      {error ? <ErrorLine message={error} /> : null}
                      <View className="mt-4">
                        <PrimaryButton
                          label="Send code"
                          icon="arrow-forward"
                          onPress={sendCode}
                          loading={loading}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text className="mb-3 text-sm font-semibold text-white/70">
                        6-digit code
                      </Text>
                      <OtpInput
                        numberOfDigits={6}
                        type="numeric"
                        autoFocus
                        focusColor={colors.lime}
                        onTextChange={setCode}
                        onFilled={(text) => {
                          setCode(text);
                          void verifyCode(text);
                        }}
                        disabled={loading}
                        theme={{
                          containerStyle: otpStyles.container,
                          pinCodeContainerStyle: otpStyles.pinCodeContainer,
                          pinCodeTextStyle: otpStyles.pinCodeText,
                          focusStickStyle: otpStyles.focusStick,
                          focusedPinCodeContainerStyle:
                            otpStyles.focusedPinCodeContainer,
                          filledPinCodeContainerStyle:
                            otpStyles.filledPinCodeContainer,
                        }}
                      />
                      {error ? <ErrorLine message={error} /> : null}
                      <View className="mt-4">
                        <PrimaryButton
                          label="Verify code"
                          icon="checkmark-circle-outline"
                          onPress={() => void verifyCode()}
                          loading={loading}
                        />
                      </View>
                      <Pressable
                        onPress={() => {
                          setStep('email');
                          setCode('');
                          setError('');
                        }}
                        className="items-center py-3 mt-2 active:opacity-60"
                      >
                        <Text className="text-[15px] font-semibold text-brand-lime">
                          Use a different email
                        </Text>
                      </Pressable>
                    </>
                  )}
                </Animated.View>
              </View>
            </View>

            {/* Trust chips */}
            <View className="flex-row gap-5 justify-center items-center mt-5">
              <TrustChip
                icon="shield-checkmark-outline"
                label="Verified pros"
              />
              <TrustChip icon="refresh-outline" label="No lock-in" />
              <TrustChip icon="camera-outline" label="Photo proof" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function TrustChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={13} color={colors.lime} />
      <Text className="text-[12px] text-white/55">{label}</Text>
    </View>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <View className="flex-row gap-2 items-start px-4 py-3 mt-3 rounded-2xl border border-red-500/30 bg-red-500/15">
      <Ionicons name="alert-circle-outline" size={17} color="#f87171" />
      <Text className="flex-1 text-[14px] leading-5 text-red-200">
        {message}
      </Text>
    </View>
  );
}

const otpStyles = StyleSheet.create({
  container: {
    width: 'auto',
  },
  pinCodeContainer: {
    width: 46,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#0C0C0D',
  },
  pinCodeText: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Outfit_600SemiBold',
  },
  focusStick: {
    backgroundColor: colors.lime,
  },
  focusedPinCodeContainer: {
    borderColor: colors.lime,
    borderWidth: 1.5,
  },
  filledPinCodeContainer: {
    borderColor: 'rgba(200,245,66,0.35)',
    backgroundColor: 'rgba(200,245,66,0.08)',
  },
});
