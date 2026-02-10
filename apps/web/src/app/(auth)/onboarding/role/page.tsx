"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../../lib/trpc";
import { setToken, isAuthenticated } from "../../../../lib/auth";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Guard: if user already has a role, redirect them
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    trpc.auth.me.query().then((user) => {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "CUSTOMER" && user.hasProfile) {
        router.push("/customer");
      } else if (user.role === "PROVIDER" && user.hasProfile) {
        router.push("/provider");
      } else if (user.role && !user.hasProfile) {
        router.push("/onboarding/profile");
      } else {
        // No role — show the selection page
        setChecking(false);
      }
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  const handleSelectRole = async (role: "CUSTOMER" | "PROVIDER") => {
    setLoading(true);
    setError("");
    try {
      const result = await trpc.auth.selectRole.mutate({ role });
      setToken(result.token);
      router.push("/onboarding/profile");
    } catch (err: any) {
      setError(err.message || "Failed to select role");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-black dark:to-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-black dark:to-black">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl dark:shadow-neutral-900/50 p-8 border border-transparent dark:border-neutral-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome!</h1>
            <p className="mt-2 text-gray-500 dark:text-neutral-400">
              How would you like to use Exterior Pro?
            </p>
          </div>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleSelectRole("CUSTOMER")}
              disabled={loading}
              className="w-full p-6 border-2 border-gray-200 dark:border-neutral-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                  🏠
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    I need services
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                    Book pressure washing, lawn care, painting, and more for your property.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectRole("PROVIDER")}
              disabled={loading}
              className="w-full p-6 border-2 border-gray-200 dark:border-neutral-800 rounded-xl hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-200 dark:group-hover:bg-green-900 transition-colors">
                  🔧
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    I provide services
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                    Manage your crew, respond to quotes, and grow your exterior service business.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
