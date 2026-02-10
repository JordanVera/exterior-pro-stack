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
        if (user.role === "ADMIN") router.push("/admin");
        else if (!user.role) router.push("/onboarding/role");
        else if (!user.hasProfile) router.push("/onboarding/profile");
        else if (user.role === "CUSTOMER") router.push("/customer");
        else if (user.role === "PROVIDER") router.push("/provider");
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-100 dark:border-neutral-900">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">EP</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Exterior Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-neutral-400">
            <a href="#services" className="hover:text-gray-900 dark:hover:text-white transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#providers" className="hover:text-gray-900 dark:hover:text-white transition-colors">For Providers</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950/20 dark:via-black dark:to-green-950/20" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 sm:pt-28 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Now serving the Dallas-Fort Worth area
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Your Property&apos;s Exterior,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Handled by Pros</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              One platform for pressure washing, lawn care, landscaping, painting, window cleaning, and more. Get instant quotes, book trusted providers, and track every job in real time.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 text-lg"
              >
                Book a Service
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all text-lg"
              >
                Join as a Provider
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-neutral-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Free quotes
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Verified providers
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Real-time tracking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">All-In-One Platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Every Exterior Service You Need</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Stop juggling multiple contractors. Exterior Pro brings all your property services under one roof with transparent pricing and professional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "💧", title: "Pressure Washing", desc: "Driveways, siding, decks, patios, and fences restored to like-new condition.", tag: "Most Popular" },
              { icon: "🌿", title: "Lawn Maintenance", desc: "Weekly mowing, edging, trimming, fertilization, and weed control programs." },
              { icon: "🌳", title: "Landscaping", desc: "Full-service design, planting, mulching, hardscaping, and seasonal cleanup." },
              { icon: "🎨", title: "Exterior Painting", desc: "Professional prep and painting for siding, trim, fences, decks, and more." },
              { icon: "✨", title: "Window Cleaning", desc: "Streak-free interior and exterior cleaning for homes and commercial properties." },
              { icon: "🏠", title: "Gutter & Roof Care", desc: "Gutter cleaning, guard installation, and gentle roof soft washing." },
            ].map((service) => (
              <div
                key={service.title}
                className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-lg dark:hover:shadow-blue-950/20 transition-all cursor-pointer"
                onClick={() => router.push("/login")}
              >
                {service.tag && (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-full">
                    {service.tag}
                  </span>
                )}
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-neutral-400 leading-relaxed">{service.desc}</p>
                <div className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Get a free quote &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Booked in Minutes, Done Right</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Describe Your Project",
                desc: "Select a service, add your property details, and tell providers what you need. It takes less than 2 minutes.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Compare Quotes",
                desc: "Receive competitive quotes from verified local providers. Compare prices, reviews, and availability side by side.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Sit Back & Relax",
                desc: "Your provider handles everything. Track job progress in real time and get notified when work is complete.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-6">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY EXTERIOR PRO ─── */}
      <section className="py-24 bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Why Exterior Pro</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Not Just Another Marketplace.
                <br />
                <span className="text-gray-400 dark:text-neutral-500">A Better Way to Manage Your Property.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-neutral-400 leading-relaxed">
                Unlike generic platforms like Thumbtack or Angi, Exterior Pro is built exclusively for exterior property services. Every feature is designed around how outdoor work actually gets done.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🎯", title: "Exterior-Focused", desc: "Purpose-built for outdoor property services, not a generic marketplace." },
                { icon: "🔒", title: "Verified Providers", desc: "Every provider is vetted before they can receive quotes on our platform." },
                { icon: "📱", title: "Real-Time Tracking", desc: "Know exactly when your crew arrives, starts, and completes work." },
                { icon: "📊", title: "Transparent Pricing", desc: "See base rates upfront. No hidden fees or surprise charges after the fact." },
                { icon: "🔄", title: "Recurring Scheduling", desc: "Set up weekly, biweekly, or monthly services that run on autopilot." },
                { icon: "💬", title: "Instant Notifications", desc: "SMS and in-app updates at every stage of your job from quote to completion." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOR PROVIDERS ─── */}
      <section id="providers" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 p-10 sm:p-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-3">For Service Providers</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                  Grow Your Business.
                  <br />
                  We&apos;ll Handle the Rest.
                </h2>
                <p className="mt-6 text-lg text-green-100 leading-relaxed">
                  Exterior Pro isn&apos;t just a lead generator. It&apos;s a full operations platform with crew management, job scheduling, quote tools, and customer communication — all built for the way exterior service businesses actually work.
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-8 py-4 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors text-lg shadow-lg shadow-green-900/30"
                  >
                    Start for Free
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Crew Management", desc: "Organize teams, assign members, and dispatch crews to jobs with one click." },
                  { title: "Smart Scheduling", desc: "Calendar-based job scheduling with automatic conflict detection and reminders." },
                  { title: "Quote & Invoice", desc: "Send professional quotes with custom pricing. Convert accepted quotes into jobs instantly." },
                  { title: "Customer Pipeline", desc: "Track leads from quote request to job completion. Never lose a customer again." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-green-100 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS / SOCIAL PROOF ─── */}
      <section className="py-20 bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "6+", label: "Service Categories" },
              { value: "24/7", label: "Booking Available" },
              { value: "100%", label: "Verified Providers" },
              { value: "Free", label: "Quotes, Always" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Ready to Transform Your Property?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Join thousands of homeowners who trust Exterior Pro for all their outdoor property needs. Get your first quote in minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 text-lg"
            >
              Get Your Free Quote
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 text-gray-700 dark:text-neutral-300 font-semibold rounded-xl border-2 border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-all text-lg"
            >
              List Your Business
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 dark:border-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">EP</div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Exterior Pro</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-neutral-500 leading-relaxed">
                The all-in-one platform for exterior property services. Book, track, and manage everything from your phone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">For Homeowners</h4>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-neutral-400">
                <li><button onClick={() => router.push("/login")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Browse Services</button></li>
                <li><button onClick={() => router.push("/login")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Get a Quote</button></li>
                <li><button onClick={() => router.push("/login")} className="hover:text-gray-900 dark:hover:text-white transition-colors">My Properties</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">For Providers</h4>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-neutral-400">
                <li><button onClick={() => router.push("/login")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Join as Provider</button></li>
                <li><button onClick={() => router.push("/login")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Manage Crews</button></li>
                <li><button onClick={() => router.push("/login")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Provider Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-neutral-400">
                <li><span className="cursor-default">About</span></li>
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-neutral-900 text-center text-sm text-gray-400 dark:text-neutral-600">
            &copy; {new Date().getFullYear()} Exterior Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
