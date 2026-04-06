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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <HomeNav />

      <HomeHeroSection />
      <HomePlansSection />
      <HomeServicesSection />
      <HomeHowItWorksSection />
      <HomeWhySection />
      <HomeProvidersSection />
      <HomeStatsSection />
      <HomeFinalCtaSection />

      <HomeFooter />
    </div>
  );
}
