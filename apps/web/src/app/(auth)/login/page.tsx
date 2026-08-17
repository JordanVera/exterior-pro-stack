'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { trpc } from '../../../lib/trpc';
import { setToken } from '../../../lib/auth';
import { isAuthIntent, rolePath } from '@/lib/auth-intent';
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
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundBeams } from '@/components/ui/background-beams';

type Step = 'phone' | 'code';

const OTP_SLOT_CLASS =
  'rounded-lg p-1.5 backdrop-blur-sm [&>div]:h-12 [&>div]:w-12 [&>div]:border [&>div]:border-border [&>div]:bg-background/60 [&>div]:text-foreground [&>div]:text-xl [&>div]:font-medium [&>div]:first:rounded-l-md [&>div]:last:rounded-r-md [&>div[data-active]]:ring-2 [&>div[data-active]]:ring-brand-lime [&>div[data-active]]:border-brand-lime/50 [&>div[role=separator]]:h-12 [&>div[role=separator]]:w-0 [&>div[role=separator]]:border-0 [&>div[role=separator]]:bg-transparent [&>div[role=separator]]:flex [&>div[role=separator]]:items-center [&>div[role=separator]]:justify-center [&>div[role=separator]]:px-2';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get('intent');
  const intent = isAuthIntent(intentParam) ? intentParam : null;
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
      if (result.user.role === 'CREW') {
        setError(
          'Crew members should use the Exterior Pro mobile app to view assigned jobs.',
        );
        return;
      }
      await setToken(result.token);
      if (result.user.role === 'ADMIN') router.push('/admin');
      else if (result.user.isNewUser || !result.user.role)
        router.push(rolePath(intent));
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
    <div className="flex overflow-hidden relative flex-col min-h-screen bg-background text-foreground">
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BackgroundBeams className="opacity-40" delay={0} />

      <header className="relative z-20 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-black/70">
          <Link href="/" className="flex gap-2 items-center pl-1">
            <Image
              src="/logos/logo-stacked.png"
              alt="Exterior Pro"
              width={84}
              height={32}
              priority
            />
          </Link>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex relative z-10 flex-1 justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="relative p-8 rounded-2xl border shadow-lg backdrop-blur-xl border-border bg-background/80">
            <CardHeader className="p-0 mb-6 space-y-3 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {step === 'phone' ? 'Welcome back' : 'Check your messages'}
              </h1>
              <CardDescription>
                {step === 'phone'
                  ? intent === 'provider'
                    ? 'Enter your phone number to join as a provider'
                    : intent === 'customer'
                      ? 'Enter your phone number to get your property handled'
                      : 'Enter your phone number to get started'
                  : 'Enter the verification code we sent you'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {step === 'phone' && (
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 h-9 text-sm rounded-l-md border border-r-0 border-input bg-muted/50 text-muted-foreground">
                        +1
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="(555) 123-4567"
                        className="flex-1 rounded-l-none focus-visible:ring-brand-lime"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    size="lg"
                    className="w-full font-semibold rounded-xl bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                  >
                    {loading ? 'Sending...' : 'Send verification code'}
                  </Button>
                </form>
              )}

              {step === 'code' && (
                <form
                  onSubmit={handleVerifyCode}
                  className="justify-center space-y-6"
                >
                  <div className="flex flex-col justify-center items-center space-y-2">
                    <Label>Verification Code</Label>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={code}
                      onChange={setCode}
                      className="justify-center"
                      containerClassName="gap-1.5"
                    >
                      <InputOTPGroup className={OTP_SLOT_CLASS}>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup className={OTP_SLOT_CLASS}>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Sent to {fullPhone}
                    </p>
                  </div>

                  {error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    size="lg"
                    className="w-full font-semibold rounded-xl bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                  >
                    {loading ? 'Verifying...' : 'Verify code'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep('phone');
                      setCode('');
                      setError('');
                    }}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Use a different number
                  </Button>
                </form>
              )}

              <div className="mt-6 flex flex-col items-center justify-center gap-0.5 font-mono text-xs text-muted-foreground">
                <p>customer: 5551001001</p>
                <p>provider: 5552001001</p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
