"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEP_ACCENTS = [
  "from-blue-500/80 to-indigo-600/80 shadow-blue-500/25",
  "from-sky-500/80 to-cyan-600/80 shadow-sky-500/25",
  "from-violet-500/80 to-purple-600/80 shadow-violet-500/25",
  "from-emerald-500/80 to-teal-600/80 shadow-emerald-500/25",
] as const;

const STEPS = [
  {
    step: "01",
    title: "Choose a Plan or Post a Job",
    desc: "Subscribe to recurring services or post a one-time job request with your property details. It takes less than 2 minutes.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Providers Bid",
    desc: "Verified local providers in your area see your job and submit competitive bids with pricing and availability.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Pick Your Pro",
    desc: "Compare bids side by side — pricing, provider ratings, and notes. Accept the best fit with one click.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Sit Back & Relax",
    desc: "Your provider handles everything. Track progress in real time and get notified when work is complete.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
] as const;

export function HomeHowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-0 h-[420px] w-[420px] rounded-full bg-blue-500/[0.09] blur-[100px] dark:bg-blue-500/[0.12]" />
        <div className="absolute bottom-0 right-[5%] h-[360px] w-[480px] rounded-full bg-cyan-400/[0.07] blur-[90px] dark:bg-cyan-500/[0.1]" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(80,100,160,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(80,100,160,0.06) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            How it works
          </p>
          <h2 className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl dark:to-white/50">
            Book in minutes.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Plans or one-time jobs — same transparent flow from request to
            completion.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((item, index) => (
            <Card
              key={item.step}
              className={cn(
                "group relative h-full overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-white/80 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:shadow-blue-950/40",
                "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-400/50 before:to-transparent dark:before:via-blue-400/35"
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/12 to-cyan-500/6 opacity-80 blur-2xl transition-opacity group-hover:opacity-100 dark:from-blue-400/15"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-2 right-3 text-7xl font-bold tabular-nums leading-none text-foreground/[0.04] dark:text-white/[0.06]"
              >
                {item.step}
              </span>

              <CardContent className="relative p-7 text-center sm:p-8">
                <div
                  className={cn(
                    "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br p-2.5 text-white shadow-lg ring-4 ring-white/60 dark:ring-white/10",
                    "transition-transform duration-300 group-hover:scale-105",
                    STEP_ACCENTS[index]
                  )}
                >
                  {item.icon}
                </div>
                {/* <div className="mb-2 inline-flex rounded-full border border-blue-500/15 bg-blue-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                    Step {item.step}
                  </div> */}
                <h3 className="mb-3 text-lg font-semibold leading-snug text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
