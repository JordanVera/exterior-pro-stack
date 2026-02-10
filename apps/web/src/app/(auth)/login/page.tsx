"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../lib/trpc";
import { setToken } from "../../../lib/auth";

type Step = "phone" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length <= 10 ? digits : digits.slice(0, 10);
  };

  const fullPhone = `+1${phone}`;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await trpc.auth.sendCode.mutate({ phone: fullPhone });
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await trpc.auth.verifyCode.mutate({ phone: fullPhone, code });
      setToken(result.token);
      if (result.user.role === "ADMIN") router.push("/admin");
      else if (result.user.isNewUser || !result.user.role) router.push("/onboarding/role");
      else if (!result.user.hasProfile) router.push("/onboarding/profile");
      else if (result.user.role === "CUSTOMER") router.push("/customer");
      else if (result.user.role === "PROVIDER") router.push("/provider");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Galaxy background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/galaxy-bg.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Subtle animated stars layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: "10%", left: "15%", animationDelay: "0s", animationDuration: "3s" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: "25%", left: "80%", animationDelay: "1s", animationDuration: "4s" }} />
        <div className="absolute w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{ top: "60%", left: "10%", animationDelay: "2s", animationDuration: "3.5s" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: "80%", left: "70%", animationDelay: "0.5s", animationDuration: "5s" }} />
        <div className="absolute w-1 h-1 bg-cyan-200 rounded-full animate-pulse" style={{ top: "45%", left: "90%", animationDelay: "1.5s", animationDuration: "4.5s" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: "15%", left: "50%", animationDelay: "3s", animationDuration: "3s" }} />
        <div className="absolute w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{ top: "70%", left: "35%", animationDelay: "2.5s", animationDuration: "4s" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: "35%", left: "25%", animationDelay: "1s", animationDuration: "5s" }} />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Back to home */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </button>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 p-8 border border-white/20 dark:border-white/10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-600 mb-4 shadow-lg shadow-cyan-600/30">
              <span className="text-white font-bold text-xl">EP</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Exterior Pro</h1>
            <p className="mt-2 text-white/60">
              {step === "phone"
                ? "Enter your phone number to get started"
                : "Enter the verification code we sent you"}
            </p>
          </div>

          {/* Phone Step */}
          {step === "phone" && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-white/20 bg-white/5 text-white/50 text-sm">
                    +1
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(555) 123-4567"
                    className="flex-1 block w-full rounded-r-lg border border-white/20 px-4 py-3 text-white bg-white/5 placeholder-white/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none backdrop-blur-sm"
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-3 px-4 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-600/25"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* Code Step */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="block w-full rounded-lg border border-white/20 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white bg-white/5 placeholder-white/20 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none backdrop-blur-sm"
                  autoFocus
                />
                <p className="mt-2 text-sm text-white/50">Sent to {fullPhone}</p>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 px-4 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-600/25"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                className="w-full py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-white/30 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
