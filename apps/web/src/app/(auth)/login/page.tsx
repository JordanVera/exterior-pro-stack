'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
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

type Step = 'email' | 'code';

const headings = {
  customer: 'Get your property handled',
  provider: 'Join as a provider',
  none: 'Sign in or get started',
} as const;

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
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await trpc.auth.sendCode.mutate({ email: normalizedEmail });
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
        email: normalizedEmail,
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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Left: photo panel (desktop only) ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[52%] xl:w-[55%]">
        <Image
          src="/landing/why/exterior-only.webp"
          alt="A beautifully maintained property"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        {/* Overlay — stronger at bottom so content reads cleanly */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/75 via-brand-navy/60 to-black/80" />

        <div className="flex relative z-10 flex-col justify-between p-12 h-full xl:p-16">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logos/logo-stacked-lime.png"
              alt="Exterior Pro"
              width={100}
              height={38}
              priority
            />
          </Link>

          {/* Hero copy */}
          <div>
            <p className="text-4xl font-bold tracking-tight leading-tight text-white xl:text-5xl">
              Your property,
              <br />
              <span className="text-brand-lime">always ready.</span>
            </p>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/70">
              Subscribe to a recurring plan and the same verified crew shows up
              on schedule — or post a one-time job and let local pros compete
              for it.
            </p>

            {/* Rating bar */}
            <div className="flex gap-3 items-center mt-8">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-brand-lime text-brand-lime"
                  />
                ))}
              </span>
              <span className="text-sm text-white/75">
                4.9 avg. rating · 12,400+ jobs completed
              </span>
            </div>
          </div>

          {/* Testimonial */}
          <figure className="p-6 rounded-2xl border backdrop-blur-sm border-white/15 bg-white/10">
            <blockquote className="text-sm leading-relaxed text-white/90">
              &ldquo;I had been calling three different companies for mowing,
              gutters, and the driveway. Now it&apos;s one plan and the same
              crew shows up every week without me asking.&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5">
              <span className="flex justify-center items-center w-8 h-8 text-xs font-bold rounded-full bg-brand-lime/25 text-brand-lime">
                MW
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Marcus Webb</p>
                <p className="text-xs text-white/55">Homeowner, Franklin TN</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-col flex-1">
        {/* Top nav */}
        <header className="flex justify-between items-center px-6 py-4">
          {/* Mobile-only logo */}
          <Link href="/" className="lg:hidden">
            <Image
              src="/logos/logo-stacked-lime.png"
              alt="Exterior Pro"
              width={80}
              height={30}
            />
          </Link>
          <div className="hidden lg:block" />

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
              Back
            </Button>
          </div>
        </header>

        {/* Centered form */}
        <main className="flex flex-1 justify-center items-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="p-8 rounded-2xl border shadow-lg border-border bg-card">
              <CardHeader className="p-0 mb-6 space-y-3 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {step === 'email'
                    ? headings[intent ?? 'none']
                    : 'Check your email'}
                </h1>
                <CardDescription>
                  {step === 'email'
                    ? "Sign in or create an account with your email. We'll send a 6-digit code — there's no password to remember."
                    : `Enter the 6-digit code we sent to ${normalizedEmail}.`}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {step === 'email' && (
                  <form onSubmit={handleSendCode} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoFocus
                        className="focus-visible:ring-brand-lime"
                      />
                    </div>
                    {error ? (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={loading || !normalizedEmail.includes('@')}
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
                        setStep('email');
                        setCode('');
                        setError('');
                      }}
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      Use a different email
                    </Button>
                  </form>
                )}

                {process.env.NODE_ENV === 'production' ? null : (
                  <div className="mt-6 flex flex-col items-center justify-center gap-0.5 font-mono text-xs text-muted-foreground">
                    <p className="text-cyan-400">
                      customer: jordan.vera96@gmail.com
                    </p>
                    <p className="text-cyan-400">
                      provider: payouts@dfwpowerwash.example.com
                    </p>
                  </div>
                )}
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
    </div>
  );
}
