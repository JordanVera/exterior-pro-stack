"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Crew Management",
    desc: "Organize teams, assign members, and dispatch crews to jobs with one click.",
  },
  {
    title: "Smart Scheduling",
    desc: "Calendar-based job scheduling with automatic conflict detection and reminders.",
  },
  {
    title: "Bid & Win Jobs",
    desc: "Browse open job requests in your area, submit competitive bids, and win new customers.",
  },
  {
    title: "Recurring Revenue",
    desc: "Get assigned to subscription customers and earn steady recurring income — no re-bidding needed.",
  },
] as const;

export function HomeProvidersSection() {
  const router = useRouter();

  return (
    <section id="providers" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.06] bg-gradient-to-br from-white via-[#f0f4ff] to-[#e8f0fe] p-10 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.25)] dark:border-white/[0.08] dark:from-black dark:via-[#0a0f1a] dark:to-[#060912] dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] sm:p-14 md:p-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(120,140,180,0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(120,140,180,0.12) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl dark:bg-blue-500/20" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/15" />

          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                For providers
              </p>
              <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                Operations, scheduling, bids — one stack.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Crews, calendars, marketplace bids, and recurring subscription
                routes — built for how exterior businesses run day to day.
              </p>
              <div className="mt-10">
                <Button
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="h-12 rounded-full bg-slate-900 px-8 text-base text-white hover:bg-slate-900/90 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
                >
                  Start free
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {FEATURES.map((item, i) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-white/60 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:backdrop-blur-md"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-semibold text-blue-600 dark:bg-white/10 dark:text-white">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
