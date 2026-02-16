"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../lib/trpc";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trees,
  Droplets,
  Paintbrush,
  Grid3X3,
  Home as HomeIcon,
  Shield,
  Wrench,
  Sparkles,
  Scissors,
  Bug,
  Zap,
  ChevronRight,
  MapPin,
  ArrowLeft,
  Send,
  Check,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  X,
  Building2,
  Star,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

/* ────────────────── helpers ────────────────── */

function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("lawn") || n.includes("landscap")) return Trees;
  if (n.includes("pressure") || n.includes("wash")) return Droplets;
  if (n.includes("paint")) return Paintbrush;
  if (n.includes("window")) return Grid3X3;
  if (n.includes("gutter")) return HomeIcon;
  if (n.includes("roof")) return Shield;
  if (n.includes("pest") || n.includes("bug")) return Bug;
  if (n.includes("light") || n.includes("electric")) return Zap;
  if (n.includes("clean")) return Sparkles;
  if (n.includes("trim") || n.includes("hedge")) return Scissors;
  return Wrench;
}

const CATEGORY_COLORS = [
  { bg: "bg-emerald-500/10", icon: "text-emerald-400" },
  { bg: "bg-blue-500/10", icon: "text-blue-400" },
  { bg: "bg-amber-500/10", icon: "text-amber-400" },
  { bg: "bg-purple-500/10", icon: "text-purple-400" },
  { bg: "bg-rose-500/10", icon: "text-rose-400" },
  { bg: "bg-teal-500/10", icon: "text-teal-400" },
];

function formatPrice(price: number | string, unit?: string) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  const str = `$${num.toFixed(2)}`;
  if (unit === "SQFT") return `${str}/sq ft`;
  if (unit === "HOUR") return `${str}/hr`;
  return str;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateString() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STEPS = ["Category", "Service", "Property", "Provider", "Review"];

/* ────────────────── component ────────────────── */

export default function CustomerHomePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.service.listCategories.query(),
      trpc.quote.listForCustomer.query(),
      trpc.job.listForCustomer.query(),
      trpc.property.list.query(),
    ])
      .then(([u, cats, q, j, p]) => {
        setUser(u);
        setCategories(cats);
        setQuotes(q);
        setJobs(j);
        setProperties(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    setLoadingProviders(true);
    trpc.provider.list
      .query({ serviceId: selectedService.id })
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoadingProviders(false));
  }, [selectedService]);

  const pendingQuotes = useMemo(
    () => quotes.filter((q) => q.status === "SENT"),
    [quotes]
  );
  const activeJobs = useMemo(
    () =>
      jobs.filter((j) => ["SCHEDULED", "IN_PROGRESS"].includes(j.status)),
    [jobs]
  );
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === "COMPLETED"),
    [jobs]
  );
  const firstName = user?.customerProfile?.firstName || "there";

  const activityItems = useMemo(() => {
    const items: {
      id: string;
      icon: LucideIcon;
      color: string;
      title: string;
      sub: string;
      time: string;
      date: Date;
    }[] = [];

    quotes.forEach((q) => {
      if (q.status === "SENT") {
        items.push({
          id: `q-sent-${q.id}`,
          icon: FileText,
          color: "text-cyan-400",
          title: `Quote received for ${q.service.name}`,
          sub: q.provider.businessName,
          time: timeAgo(q.updatedAt || q.createdAt),
          date: new Date(q.updatedAt || q.createdAt),
        });
      } else if (q.status === "ACCEPTED") {
        items.push({
          id: `q-acc-${q.id}`,
          icon: Check,
          color: "text-green-400",
          title: `Accepted quote for ${q.service.name}`,
          sub: q.provider.businessName,
          time: timeAgo(q.updatedAt || q.createdAt),
          date: new Date(q.updatedAt || q.createdAt),
        });
      }
    });

    jobs.forEach((j) => {
      if (j.status === "COMPLETED" && j.completedAt) {
        items.push({
          id: `j-done-${j.id}`,
          icon: Star,
          color: "text-amber-400",
          title: `Completed: ${j.quote.service.name}`,
          sub: j.quote.property.address,
          time: timeAgo(j.completedAt),
          date: new Date(j.completedAt),
        });
      } else if (j.status === "SCHEDULED" && j.scheduledDate) {
        items.push({
          id: `j-sched-${j.id}`,
          icon: Clock,
          color: "text-blue-400",
          title: `Scheduled: ${j.quote.service.name}`,
          sub: new Date(j.scheduledDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          time: timeAgo(j.createdAt),
          date: new Date(j.createdAt),
        });
      }
    });

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 6);
  }, [quotes, jobs]);

  const goToStep = (target: number) => {
    if (target <= 4) {
      setSelectedProvider(null);
      setNotes("");
    }
    if (target <= 3) setSelectedProperty(null);
    if (target <= 2) {
      setSelectedService(null);
      setProviders([]);
    }
    if (target <= 1) setSelectedCategory(null);
    setError("");
    setStep(target);
  };

  const resetBuilder = () => {
    goToStep(1);
    setSuccess(false);
  };

  const pickCategory = (cat: any) => {
    setSelectedCategory(cat);
    setStep(2);
  };
  const pickService = (svc: any) => {
    setSelectedService(svc);
    setStep(3);
  };
  const pickProperty = (prop: any) => {
    setSelectedProperty(prop);
    setStep(4);
  };
  const pickProvider = (prov: any) => {
    setSelectedProvider(prov);
  };

  const continueToReview = () => {
    if (!selectedProvider) {
      setError("Please select a provider");
      return;
    }
    setError("");
    setStep(5);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedProperty || !selectedProvider) return;
    setSubmitting(true);
    setError("");
    try {
      await trpc.quote.request.mutate({
        serviceId: selectedService.id,
        propertyId: selectedProperty.id,
        providerId: selectedProvider.id,
        customerNotes: notes || undefined,
      });
      setSuccess(true);
      trpc.quote.listForCustomer
        .query()
        .then(setQuotes)
        .catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div>
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Greeting ── */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{getDateString()}</p>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Pending",
            sub: "quotes",
            count: pendingQuotes.length,
            dot: "bg-cyan-500",
            href: "/customer/quotes",
          },
          {
            label: "Active",
            sub: "jobs",
            count: activeJobs.length,
            dot: "bg-blue-500",
            href: "/customer/jobs",
          },
          {
            label: "Completed",
            sub: "jobs",
            count: completedJobs.length,
            dot: "bg-green-500",
            href: "/customer/jobs",
          },
          {
            label: "Properties",
            sub: "saved",
            count: properties.length,
            dot: "bg-neutral-400",
            href: "/customer/settings",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="cursor-pointer shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
            onClick={() => router.push(s.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {s.count}
              </div>
              <div className="text-[11px] text-neutral-400 dark:text-neutral-600">
                {s.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Quote Builder ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Get a Quote
          </h2>
          {step > 1 && !success && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetBuilder}
              className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 h-7 px-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Start over
            </Button>
          )}
        </div>

        {/* progress dots */}
        {step > 1 && !success && (
          <div className="flex items-center gap-1 mb-5">
            {STEPS.map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const current = step === num;
              return (
                <div key={label} className="flex items-center">
                  <button
                    onClick={() => (done ? goToStep(num) : undefined)}
                    disabled={!done}
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-medium transition-all",
                      done &&
                        "text-cyan-500 cursor-pointer hover:text-cyan-400",
                      current && "text-neutral-900 dark:text-white",
                      !done &&
                        !current &&
                        "text-neutral-300 dark:text-neutral-700"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                        done && "bg-cyan-500/20 text-cyan-400",
                        current && "bg-cyan-500 text-white",
                        !done &&
                          !current &&
                          "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600"
                      )}
                    >
                      {done ? <Check className="w-3 h-3" /> : num}
                    </div>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-4 sm:w-8 h-px mx-1",
                        done
                          ? "bg-cyan-500/30"
                          : "bg-neutral-200 dark:bg-neutral-800"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* selection chips */}
        {step > 1 && !success && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {step >= 2 && selectedCategory && (
              <Badge
                variant="secondary"
                className="rounded-full border-0 gap-1.5 pr-1.5"
              >
                {(() => {
                  const Icon = getCategoryIcon(selectedCategory.name);
                  return <Icon className="w-3 h-3" />;
                })()}
                {selectedCategory.name}
                <button
                  onClick={() => goToStep(1)}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {step >= 3 && selectedService && (
              <>
                <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
                <Badge
                  variant="secondary"
                  className="rounded-full border-0 gap-1.5 pr-1.5"
                >
                  {selectedService.name}
                  <button
                    onClick={() => goToStep(2)}
                    className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </>
            )}
            {step >= 4 && selectedProperty && (
              <>
                <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
                <Badge
                  variant="secondary"
                  className="rounded-full border-0 gap-1.5 pr-1.5"
                >
                  <MapPin className="w-3 h-3" />
                  {selectedProperty.address}
                  <button
                    onClick={() => goToStep(3)}
                    className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </>
            )}
            {step >= 5 && selectedProvider && (
              <>
                <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
                <Badge
                  variant="secondary"
                  className="rounded-full border-0 gap-1.5"
                >
                  <Building2 className="w-3 h-3" />
                  {selectedProvider.businessName}
                </Badge>
              </>
            )}
          </div>
        )}

        {/* step content */}
        {success ? (
          <Card className="animate-step-enter shadow-none">
            <CardContent className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full animate-scale-check bg-green-500/10">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-white">
                Quote Request Sent
              </h3>
              <p className="mb-6 text-sm text-neutral-500">
                You&apos;ll be notified when the provider responds.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={resetBuilder} className="rounded-full">
                  Request another
                </Button>
                <Button
                  onClick={() => router.push("/customer/quotes")}
                  className="rounded-full bg-cyan-500 hover:bg-cyan-400"
                >
                  View quotes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div key={step} className="animate-step-enter">
            {/* Step 1: Category */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((cat, i) => {
                  const Icon = getCategoryIcon(cat.name);
                  const colors =
                    CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                  const count = cat.services?.length || 0;
                  const hasImage = !!cat.image;
                  return (
                    <Card
                      key={cat.id}
                      className={cn(
                        "cursor-pointer shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-neutral-300 dark:hover:border-neutral-700 overflow-hidden",
                        hasImage && "border-0"
                      )}
                      onClick={() => pickCategory(cat)}
                    >
                      <CardContent
                        className={cn(
                          "relative p-4 min-h-[120px] flex flex-col justify-end",
                          hasImage && "bg-cover bg-center"
                        )}
                        style={
                          hasImage
                            ? {
                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2)), url(${cat.image})`,
                              }
                            : undefined
                        }
                      >
                        <div className="relative z-10">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                              hasImage ? "bg-white/20" : colors.bg
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5",
                                hasImage ? "text-white" : colors.icon
                              )}
                            />
                          </div>
                          <div
                            className={cn(
                              "text-sm font-medium",
                              hasImage
                                ? "text-white drop-shadow-sm"
                                : "text-neutral-900 dark:text-white"
                            )}
                          >
                            {cat.name}
                          </div>
                          <div
                            className={cn(
                              "text-[11px] mt-0.5",
                              hasImage
                                ? "text-white/90"
                                : "text-neutral-400 dark:text-neutral-600"
                            )}
                          >
                            {count} service{count !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {categories.length === 0 && (
                  <div className="py-12 text-sm text-center col-span-full text-neutral-500">
                    No services available yet. Check back soon!
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Service */}
            {step === 2 && selectedCategory && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(1)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7 px-2 mb-1"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to categories
                </Button>
                <div className="space-y-2">
                  {selectedCategory.services?.map((svc: any) => (
                    <Card
                      key={svc.id}
                      className="cursor-pointer shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-neutral-300 dark:hover:border-neutral-700"
                      onClick={() => pickService(svc)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {svc.name}
                          </div>
                          {svc.description && (
                            <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                              {svc.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center flex-shrink-0 gap-3 ml-4">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {formatPrice(svc.basePrice, svc.unit)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!selectedCategory.services ||
                    selectedCategory.services.length === 0) && (
                    <div className="py-8 text-sm text-center text-neutral-500">
                      No services in this category yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Property */}
            {step === 3 && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(2)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7 px-2 mb-1"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to services
                </Button>
                {properties.length === 0 ? (
                  <Card className="shadow-none border-dashed">
                    <CardContent className="py-10 text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                      <p className="mb-3 text-sm text-neutral-500">
                        Add a property to continue.
                      </p>
                      <Button
                        onClick={() => router.push("/customer/settings")}
                        className="rounded-full bg-cyan-500 hover:bg-cyan-400"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Property
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {properties.map((prop) => (
                      <Card
                        key={prop.id}
                        className="cursor-pointer shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-neutral-300 dark:hover:border-neutral-700"
                        onClick={() => pickProperty(prop)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                              <MapPin className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate text-neutral-900 dark:text-white">
                                {prop.address}
                              </div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {prop.city}, {prop.state} {prop.zip}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Provider + Notes */}
            {step === 4 && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(3)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7 px-2 mb-1"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to properties
                </Button>

                {loadingProviders ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                  </div>
                ) : providers.length === 0 ? (
                  <Card className="shadow-none border-dashed">
                    <CardContent className="py-10 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                      <p className="text-sm text-neutral-500">
                        No providers available for this service yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                        Select a provider
                      </label>
                      {providers.map((prov) => {
                        const isSelected =
                          selectedProvider?.id === prov.id;
                        return (
                          <Card
                            key={prov.id}
                            className={cn(
                              "cursor-pointer shadow-none transition-all duration-200",
                              isSelected
                                ? "border-cyan-500 ring-1 ring-cyan-500/20"
                                : "hover:border-neutral-300 dark:hover:border-neutral-700"
                            )}
                            onClick={() => pickProvider(prov)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback
                                    className={cn(
                                      "text-xs font-semibold transition-colors",
                                      isSelected
                                        ? "bg-cyan-500 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                    )}
                                  >
                                    {prov.businessName?.[0]?.toUpperCase() ||
                                      "P"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                    {prov.businessName}
                                  </div>
                                  {prov.serviceArea && (
                                    <div className="text-xs text-neutral-500 mt-0.5">
                                      {prov.serviceArea}
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check className="flex-shrink-0 w-4 h-4 text-cyan-500" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                        Notes (optional)
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe what you need, special requirements..."
                        rows={3}
                        maxLength={2000}
                        className="text-sm resize-none"
                      />
                      <div className="text-right text-[11px] text-neutral-400">
                        {notes.length}/2000
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-400">{error}</p>
                    )}

                    <Button
                      onClick={continueToReview}
                      className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400"
                    >
                      Continue to Review
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(4)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7 px-2 mb-1"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back
                </Button>

                <Card className="shadow-none overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                      Review Your Request
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10">
                          {(() => {
                            const Icon = getCategoryIcon(
                              selectedCategory?.name || ""
                            );
                            return (
                              <Icon className="w-4 h-4 text-cyan-400" />
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-[11px] text-neutral-500">
                            Service
                          </div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedService?.name}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {selectedCategory?.name} &middot;{" "}
                            {formatPrice(
                              selectedService?.basePrice || 0,
                              selectedService?.unit
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <div className="text-[11px] text-neutral-500">
                            Property
                          </div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedProperty?.address}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {selectedProperty?.city},{" "}
                            {selectedProperty?.state}{" "}
                            {selectedProperty?.zip}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                          <Building2 className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <div className="text-[11px] text-neutral-500">
                            Provider
                          </div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedProvider?.businessName}
                          </div>
                          {selectedProvider?.serviceArea && (
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {selectedProvider.serviceArea}
                            </div>
                          )}
                        </div>
                      </div>

                      {notes && (
                        <>
                          <Separator />
                          <div>
                            <div className="text-[11px] text-neutral-500 mb-1">
                              Notes
                            </div>
                            <div className="text-sm text-neutral-700 dark:text-neutral-300">
                              {notes}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>

                  {error && (
                    <div className="px-5 pb-2">
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="px-5 pb-5">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Quote Request
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Recent Activity ── */}
      {activityItems.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Activity
          </h2>
          <div className="space-y-1">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div className="flex items-center justify-center flex-shrink-0 rounded-full w-7 h-7 bg-neutral-100 dark:bg-neutral-800/60">
                    <Icon className={cn("w-3.5 h-3.5", item.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate text-neutral-900 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {item.sub}
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-600 flex-shrink-0">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Active Jobs ── */}
      {activeJobs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Active Jobs
            </h2>
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push("/customer/jobs")}
              className="text-xs text-cyan-500 hover:text-cyan-400 h-auto p-0"
            >
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {activeJobs.slice(0, 3).map((job) => (
              <Card key={job.id} className="shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {job.quote.service.name}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 truncate">
                      {job.quote.property.address}
                      {job.scheduledDate &&
                        ` · ${new Date(
                          job.scheduledDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full border-0 text-[10px] uppercase tracking-wide",
                      job.status === "SCHEDULED"
                        ? "bg-cyan-500/10 text-cyan-500"
                        : "bg-amber-500/10 text-amber-500"
                    )}
                  >
                    {job.status.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
