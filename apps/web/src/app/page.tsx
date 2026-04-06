"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { isAuthenticated } from "../lib/auth";
import { HomeNav } from "./_components/home/home-nav";
import { HomeFooter } from "./_components/home/home-footer";
import { HomeHeroSection } from "./_components/home/home-hero-section";
import { HomePlansSection } from "./_components/home/home-plans-section";
import { HomeServicesSection } from "./_components/home/home-services-section";
import { HomeHowItWorksSection } from "./_components/home/home-how-it-works-section";
import { HomeWhySection } from "./_components/home/home-why-section";
import { HomeProvidersSection } from "./_components/home/home-providers-section";
import { HomeStatsSection } from "./_components/home/home-stats-section";
import { HomeAppDownloadSection } from "./_components/home/home-app-download-section";
import { HomeFinalCtaSection } from "./_components/home/home-final-cta-section";

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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] dark:bg-black">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f5f7] dark:bg-black">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[min(70vh,640px)] w-[min(120vw,900px)] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[100px] dark:bg-blue-600/[0.12]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[min(50vh,480px)] w-[min(90vw,560px)] rounded-full bg-cyan-300/15 blur-[90px] dark:bg-cyan-500/[0.08]" />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(100,120,160,0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100,120,160,0.07) 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <HomeNav />

      <HomeHeroSection />
      <HomeHowItWorksSection />
      <HomeServicesSection />
      <HomePlansSection />
      <HomeWhySection />
      <HomeProvidersSection />
      <HomeStatsSection />
      <HomeAppDownloadSection />
      <HomeFinalCtaSection />

      <HomeFooter />
    </div>
  );
}
