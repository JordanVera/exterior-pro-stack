"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** Placeholder hero shots — swap for your own assets anytime. */
const SERVICES = [
  {
    icon: "🌿",
    title: "Lawn Maintenance",
    desc: "Weekly or biweekly mowing, edging, trimming, fertilization, and weed control programs.",
    tag: "Weekly / Biweekly",
    tagColor:
      "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400",
    image: "/services/lawn-maintenance.jpg",
  },
  {
    icon: "🌳",
    title: "Landscaping",
    desc: "Full-service design, planting, mulching, hardscaping, and seasonal cleanup.",
    tag: "Weekly / Biweekly",
    tagColor:
      "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400",
    image: "/services/landscaping.webp",
  },
  {
    icon: "🪴",
    title: "Weed Control",
    desc: "Targeted treatments, pre-emergent applications, and ongoing prevention programs.",
    tag: "Monthly / Quarterly",
    tagColor:
      "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    image: "/services/weed-control.webp",
  },
  {
    icon: "🏠",
    title: "Gutter Cleaning",
    desc: "Thorough gutter and downspout cleaning, guard installation, and debris removal.",
    tag: "Quarterly / Biannual",
    tagColor:
      "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    image: "/services/gutter-cleaning.jpg",
  },
  {
    icon: "💧",
    title: "Pressure Washing",
    desc: "Driveways, siding, decks, patios, and fences restored to like-new condition.",
    tag: "Most Popular",
    tagColor:
      "bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400",
    image: "/services/pressure-washing.png",
  },
  {
    icon: "🎨",
    title: "Exterior Painting",
    desc: "Professional prep and painting for siding, trim, fences, decks, and more.",
    tag: "One-Time",
    tagColor:
      "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400",
    image: "/services/exterior-painting.jpg",
  },
  {
    icon: "✨",
    title: "Window Cleaning",
    desc: "Streak-free interior and exterior cleaning for homes and commercial properties.",
    tag: "Biannual / One-Time",
    tagColor:
      "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    image: "/services/window-cleaning.jpg",
  },
  {
    icon: "🛠️",
    title: "Roof Care",
    desc: "Gentle roof soft washing, moss removal, and preventive maintenance.",
    tag: "Biannual",
    tagColor:
      "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    image: "/services/roof-care.jpeg",
  },
  {
    icon: "🌲",
    title: "Tree & Shrub Care",
    desc: "Pruning, trimming, health assessments, and removal for all property types.",
    tag: "Seasonal / One-Time",
    tagColor:
      "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    image: "/services/tree-and-shrub-care.jpg",
  },
] as const;

export function HomeServicesSection() {
  const router = useRouter();

  return (
    <section id="services" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            All services
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Subscriptions &amp; one-time jobs
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Every service works on a plan or as a standalone request. Post what
            you need and let verified providers bid.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card
              key={service.title}
              className="group relative aspect-[8/5] w-full cursor-pointer overflow-hidden rounded-[1.5rem] border border-black/[0.08] bg-transparent shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-xl dark:border-white/[0.1] dark:hover:border-blue-500/30"
              onClick={() => router.push("/login")}
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-white/[0.96] via-white/[0.72] to-white/[0.12] dark:from-neutral-950/[0.96] dark:via-neutral-950/[0.72] dark:to-neutral-950/[0.12]"
              />
              <CardContent className="relative z-10 flex h-full min-h-0 flex-col p-4 sm:p-5">
                <div className="flex shrink-0 justify-end">
                  {service.tag && (
                    <Badge
                      className={`rounded-full border-0 px-2.5 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-md sm:text-xs ${service.tagColor}`}
                    >
                      {service.tag}
                    </Badge>
                  )}
                </div>
                <div className="mt-auto flex min-h-0 flex-col gap-1.5 pt-2">
                  <div className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-sm backdrop-blur-md dark:bg-white/10 sm:h-11 sm:w-11 sm:text-[1.65rem]">
                    {service.icon}
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 sm:text-[1.05rem]">
                    {service.title}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-snug">
                    {service.desc}
                  </p>
                  <div className="flex items-center gap-1 pt-0.5 text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400 sm:text-sm">
                    Request service{" "}
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
