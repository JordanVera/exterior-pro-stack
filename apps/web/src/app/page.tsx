"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { isAuthenticated } from "../lib/auth";
import { ThemeToggle } from "../components/ThemeToggle";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setChecking(false);
      return;
    }

    trpc.auth.me
      .query()
      .then((user) => {
        if (!user.role) {
          router.push("/onboarding/role");
        } else if (!user.hasProfile) {
          router.push("/onboarding/profile");
        } else if (user.role === "CUSTOMER") {
          router.push("/customer");
        } else if (user.role === "PROVIDER") {
          router.push("/provider");
        } else if (user.role === "ADMIN") {
          router.push("/admin");
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-black dark:via-black dark:to-black">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exterior Pro</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Professional Exterior
            <br />
            <span className="text-blue-600 dark:text-blue-400">Property Services</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
            Book pressure washing, lawn care, landscaping, painting, window
            cleaning, and more — all from one platform.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-lg"
            >
              I&apos;m a Provider
            </button>
          </div>
        </div>

        {/* Services grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "💧", title: "Pressure Washing", desc: "Driveways, siding, decks, and more" },
            { icon: "🌿", title: "Lawn Maintenance", desc: "Mowing, edging, trimming, fertilization" },
            { icon: "🌳", title: "Landscaping", desc: "Design, planting, mulching, hardscaping" },
            { icon: "🎨", title: "Painting", desc: "Exterior and interior painting" },
            { icon: "✨", title: "Window Cleaning", desc: "Interior and exterior window cleaning" },
            { icon: "🏠", title: "Gutter & Roof", desc: "Gutter cleaning, roof soft wash" },
          ].map((service) => (
            <div
              key={service.title}
              className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md dark:hover:border-neutral-700 transition-all"
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {service.title}
              </h3>
              <p className="mt-1 text-gray-500 dark:text-neutral-400">{service.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
