"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  ChevronDown,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Users,
  Repeat,
} from "lucide-react";

const FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "Active" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-neutral-400",
  SCHEDULED: "bg-cyan-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-400",
};

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: {
    bg: "bg-neutral-100 dark:bg-neutral-800/60",
    text: "text-neutral-500",
    label: "Pending",
  },
  SCHEDULED: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    label: "Scheduled",
  },
  IN_PROGRESS: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    label: "In Progress",
  },
  COMPLETED: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    label: "Completed",
  },
  CANCELLED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Cancelled",
  },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    const params = filter ? { status: filter as any } : undefined;
    trpc.job.listForCustomer
      .query(params)
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full rounded-full" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
        Jobs
      </h1>

      {/* filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {FILTERS.map((f) => (
          <Badge
            key={f.value}
            variant="secondary"
            onClick={() => setFilter(f.value)}
            className={cn(
              "cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-all select-none",
              filter === f.value
                ? "bg-cyan-500 text-white hover:bg-cyan-500"
                : "hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* job list */}
      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
            {filter ? "No matching jobs" : "No jobs yet"}
          </h3>
          <p className="text-sm text-neutral-500">
            {filter
              ? "Try a different filter."
              : "Jobs will appear here once a quote is accepted."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
            const dot = STATUS_DOT[job.status] || STATUS_DOT.PENDING;
            const isOpen = expanded.has(job.id);
            const hasDetails =
              job.scheduledDate ||
              job.completedAt ||
              job.assignments?.length > 0 ||
              (job.recurringSchedule && job.recurringSchedule.active) ||
              job.quote?.customPrice;

            return (
              <Card key={job.id} className="shadow-none overflow-hidden">
                {/* main row */}
                <button
                  onClick={() => hasDetails && toggleExpand(job.id)}
                  className={cn(
                    "w-full text-left p-4 flex items-center gap-3",
                    hasDetails && "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      dot
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {job.quote.service.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full border-0 text-[10px] uppercase tracking-wide",
                          badge.bg,
                          badge.text
                        )}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 truncate">
                      {job.quote.property.address},{" "}
                      {job.quote.property.city}
                    </div>
                  </div>
                  {hasDetails && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-300 dark:text-neutral-600 transition-transform flex-shrink-0",
                        isOpen && "rotate-180"
                      )}
                    />
                  )}
                </button>

                {/* expanded details */}
                {isOpen && hasDetails && (
                  <div className="animate-step-enter">
                    <Separator />
                    <CardContent className="px-4 py-3 space-y-2.5">
                      {/* provider */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{job.quote.provider.businessName}</span>
                      </div>

                      {/* property */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>
                          {job.quote.property.address},{" "}
                          {job.quote.property.city},{" "}
                          {job.quote.property.state}{" "}
                          {job.quote.property.zip}
                        </span>
                      </div>

                      {/* scheduled date */}
                      {job.scheduledDate && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span>
                            {new Date(
                              job.scheduledDate
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                            {job.scheduledTime &&
                              ` at ${job.scheduledTime}`}
                          </span>
                        </div>
                      )}

                      {/* completed */}
                      {job.completedAt && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span>
                            Completed{" "}
                            {new Date(
                              job.completedAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      {/* price */}
                      {job.quote.customPrice && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span className="w-3.5 text-center text-neutral-400 font-bold">
                            $
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            ${Number(job.quote.customPrice).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* crew */}
                      {job.assignments?.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Users className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span>
                            Crew:{" "}
                            {job.assignments
                              .map((a: any) => a.crew.name)
                              .join(", ")}
                          </span>
                        </div>
                      )}

                      {/* recurring */}
                      {job.recurringSchedule &&
                        job.recurringSchedule.active && (
                          <div className="flex items-center gap-2 text-xs">
                            <Repeat className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <span className="text-purple-500 dark:text-purple-400">
                              {job.recurringSchedule.frequency} &middot;
                              Next:{" "}
                              {new Date(
                                job.recurringSchedule.nextDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                    </CardContent>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
