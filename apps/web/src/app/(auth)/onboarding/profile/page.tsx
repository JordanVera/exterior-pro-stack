"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../../lib/trpc";

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  useEffect(() => {
    trpc.auth.me.query().then((user) => {
      setRole(user.role);
      if (user.hasProfile) {
        if (user.role === "CUSTOMER") router.push("/customer");
        else if (user.role === "PROVIDER") router.push("/provider");
      }
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await trpc.auth.completeCustomerOnboarding.mutate({ firstName, lastName, email: email || undefined });
      router.push("/customer");
    } catch (err: any) { setError(err.message || "Failed to complete profile"); }
    finally { setLoading(false); }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await trpc.auth.completeProviderOnboarding.mutate({ businessName, description: description || undefined, serviceArea: serviceArea || undefined });
      router.push("/provider");
    } catch (err: any) { setError(err.message || "Failed to complete profile"); }
    finally { setLoading(false); }
  };

  const inputClass = "block w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-black dark:to-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-black dark:to-black">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl dark:shadow-neutral-900/50 p-8 border border-transparent dark:border-neutral-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
            <p className="mt-2 text-gray-500 dark:text-neutral-400">
              {role === "CUSTOMER" ? "Tell us a bit about yourself" : "Tell us about your business"}
            </p>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">{error}</p>}

          {role === "CUSTOMER" && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div><label className={labelClass}>First Name *</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required /></div>
              <div><label className={labelClass}>Last Name *</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required /></div>
              <div><label className={labelClass}>Email (optional)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></div>
              <button type="submit" disabled={loading || !firstName || !lastName} className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6">
                {loading ? "Saving..." : "Continue"}
              </button>
            </form>
          )}

          {role === "PROVIDER" && (
            <form onSubmit={handleProviderSubmit} className="space-y-4">
              <div><label className={labelClass}>Business Name *</label><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} required /></div>
              <div><label className={labelClass}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Tell customers about your services..." /></div>
              <div><label className={labelClass}>Service Area</label><input type="text" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} className={inputClass} placeholder="e.g., Dallas-Fort Worth metro area" /></div>
              <button type="submit" disabled={loading || !businessName} className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6">
                {loading ? "Saving..." : "Continue"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
