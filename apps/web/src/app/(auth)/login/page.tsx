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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-black dark:to-black">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl dark:shadow-neutral-900/50 p-8 border border-transparent dark:border-neutral-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exterior Pro</h1>
            <p className="mt-2 text-gray-500 dark:text-neutral-400">
              {step === "phone"
                ? "Enter your phone number to get started"
                : "Enter the verification code we sent you"}
            </p>
          </div>

          {step === "phone" && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-950 text-gray-500 dark:text-neutral-400 text-sm">
                    +1
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(555) 123-4567"
                    className="flex-1 block w-full rounded-r-lg border border-gray-300 dark:border-neutral-700 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 placeholder-gray-400 dark:placeholder-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="block w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 dark:text-white bg-white dark:bg-neutral-950 placeholder-gray-400 dark:placeholder-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">Sent to {fullPhone}</p>
              </div>
              {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                className="w-full py-2 text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
