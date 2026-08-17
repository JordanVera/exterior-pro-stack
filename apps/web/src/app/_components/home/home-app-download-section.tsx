"use client";

import { Bell, MapPin, Smartphone } from "lucide-react";
import AppStoreButton from "@/components/buttons/AppStoreButton";
import PlayStoreButton from "@/components/buttons/PlayStoreButton";
import { Card, CardContent } from "@/components/ui/card";

const HIGHLIGHTS = [
  {
    icon: Bell,
    title: "Live updates",
    desc: "Bids, schedules, and job status in your pocket.",
  },
  {
    icon: MapPin,
    title: "On-site clarity",
    desc: "Property details and routes when you need them.",
  },
  {
    icon: Smartphone,
    title: "One tap in",
    desc: "Same account as the web — pick up where you left off.",
  },
] as const;

export function HomeAppDownloadSection() {
  return (
    <section id="app" className="relative py-24 scroll-mt-28">
      <div className="px-6 mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.06] bg-gradient-to-br from-white via-[#f0f4ff] to-[#e8f0fe] p-10 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.25)] dark:border-white/[0.08] dark:from-[#0a0a0c] dark:via-[#0c1020] dark:to-[#06080f] dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] sm:p-14 md:p-16"
        >
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

          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Mobile
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Download our app.
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Manage plans, approve bids, and track jobs with the same polished
                experience you get on the web — optimized for when you&apos;re away
                from the desk.
              </p>

              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <AppStoreButton />
                <PlayStoreButton />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                <Card
                  key={title}
                  className="border-black/[0.06] bg-white/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
