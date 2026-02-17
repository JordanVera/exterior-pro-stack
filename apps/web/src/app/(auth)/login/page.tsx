'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { trpc } from '../../../lib/trpc';
import { setToken } from '../../../lib/auth';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

type Step = 'phone' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length <= 10 ? digits : digits.slice(0, 10);
  };

  const fullPhone = `+1${phone}`;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await trpc.auth.sendCode.mutate({ phone: fullPhone });
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await trpc.auth.verifyCode.mutate({
        phone: fullPhone,
        code,
      });
      setToken(result.token);
      if (result.user.role === 'ADMIN') router.push('/admin');
      else if (result.user.isNewUser || !result.user.role)
        router.push('/onboarding/role');
      else if (!result.user.hasProfile) router.push('/onboarding/profile');
      else if (result.user.role === 'CUSTOMER') router.push('/customer');
      else if (result.user.role === 'PROVIDER') router.push('/provider');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Galaxy background image */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('/galaxy-bg.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Subtle animated stars layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            top: '10%',
            left: '15%',
            animationDelay: '0s',
            animationDuration: '3s',
          }}
        />
        <div
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
          style={{
            top: '25%',
            left: '80%',
            animationDelay: '1s',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-cyan-300 animate-pulse"
          style={{
            top: '60%',
            left: '10%',
            animationDelay: '2s',
            animationDuration: '3.5s',
          }}
        />
        <div
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
          style={{
            top: '80%',
            left: '70%',
            animationDelay: '0.5s',
            animationDuration: '5s',
          }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-cyan-200 animate-pulse"
          style={{
            top: '45%',
            left: '90%',
            animationDelay: '1.5s',
            animationDuration: '4.5s',
          }}
        />
        <div
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
          style={{
            top: '15%',
            left: '50%',
            animationDelay: '3s',
            animationDuration: '3s',
          }}
        />
        <div
          className="absolute w-1 h-1 bg-purple-300 rounded-full animate-pulse"
          style={{
            top: '70%',
            left: '35%',
            animationDelay: '2.5s',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
          style={{
            top: '35%',
            left: '25%',
            animationDelay: '1s',
            animationDuration: '5s',
          }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Back to home */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-white/60 hover:text-white hover:bg-white/10 mb-6"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to home
        </Button>

        <Card className="p-8 border shadow-2xl bg-white/10 dark:bg-cyan-500/20 backdrop-blur-xl rounded-2xl shadow-black/50 border-white/20 dark:border-white/10">
          <CardHeader className="mb-4 text-center space-y-1.5 p-0">
            <Image
              className="mx-auto mb-8"
              src="/logos/logo-stacked.png"
              alt="Logo"
              width={200}
              height={200}
            />
            <CardDescription className=" text-white/60">
              {step === 'phone'
                ? 'Enter your phone number to get started'
                : 'Enter the verification code we sent you'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-0">
            {/* Phone Step */}
            {step === 'phone' && (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">
                    Phone Number
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 text-sm border border-r-0 rounded-l-md border-white/20 bg-white/5 text-white/50 h-9">
                      +1
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(555) 123-4567"
                      className="flex-1 text-white border-l-0 rounded-l-0 rounded-r-md border-white/20 bg-white/5 placeholder:text-white/30 focus-visible:ring-cyan-500 focus-visible:ring-2"
                      autoFocus
                    />
                  </div>
                </div>
                {error && (
                  <Alert
                    variant="destructive"
                    className="text-red-400 border-red-500/50 bg-red-500/10"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  size="lg"
                  className="w-full font-semibold text-white bg-orange-500 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/25"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {/* Code Step */}
            {step === 'code' && (
              <form
                onSubmit={handleVerifyCode}
                className="justify-center space-y-6"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Label className="text-white/80">Verification Code</Label>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={code}
                    onChange={setCode}
                    className="justify-center"
                    containerClassName="gap-1.5"
                  >
                    <InputOTPGroup className="rounded-lg p-1.5 backdrop-blur-sm [&>div]:h-12 [&>div]:w-12 [&>div]:border [&>div]:border-white/20 [&>div]:bg-white/5 [&>div]:text-white [&>div]:text-xl [&>div]:font-medium [&>div]:first:rounded-l-md [&>div]:last:rounded-r-md [&>div[data-active]]:ring-2 [&>div[data-active]]:ring-cyan-500 [&>div[data-active]]:border-cyan-500/50 [&>div[role=separator]]:h-12 [&>div[role=separator]]:w-0 [&>div[role=separator]]:border-0 [&>div[role=separator]]:bg-transparent [&>div[role=separator]]:flex [&>div[role=separator]]:items-center [&>div[role=separator]]:justify-center [&>div[role=separator]]:px-2">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    {/* <div className="w-px h-8 bg-white/40" /> */}
                    <InputOTPGroup className="rounded-lg p-1.5 backdrop-blur-sm [&>div]:h-12 [&>div]:w-12 [&>div]:border [&>div]:border-white/20 [&>div]:bg-white/5 [&>div]:text-white [&>div]:text-xl [&>div]:font-medium [&>div]:first:rounded-l-md [&>div]:last:rounded-r-md [&>div[data-active]]:ring-2 [&>div[data-active]]:ring-cyan-500 [&>div[data-active]]:border-cyan-500/50 [&>div[role=separator]]:h-12 [&>div[role=separator]]:w-0 [&>div[role=separator]]:border-0 [&>div[role=separator]]:bg-transparent [&>div[role=separator]]:flex [&>div[role=separator]]:items-center [&>div[role=separator]]:justify-center [&>div[role=separator]]:px-2">
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="mt-2 text-sm text-white/50">
                    Sent to {fullPhone}
                  </p>
                </div>

                {error && (
                  <Alert
                    variant="destructive"
                    className="text-red-400 border-red-500/50 bg-red-500/10"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  size="lg"
                  className="w-full font-semibold text-white bg-orange-600 h-11 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/25"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                    setError('');
                  }}
                  className="w-full py-2 text-sm text-white/40 hover:text-white/70 hover:bg-white/10"
                >
                  Use a different number
                </Button>
              </form>
            )}

            <div className="flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-center text-yellow-300">
                customer: 5551001001
              </p>
              <p className="text-xs font-bold text-center text-yellow-300">
                provider: 5552001001
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="mt-4 text-xs font-bold text-center text-yellow-300">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
