"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DollarSign,
  Check,
  X,
} from "lucide-react";

const FILTERS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "PENDING", label: "Pending" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "Active" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_DOT: Record<string, string> = {
  OPEN: "bg-cyan-500",
  PENDING: "bg-neutral-400",
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-400",
};

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  OPEN: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    label: "Open",
  },
  PENDING: {
    bg: "bg-neutral-100 dark:bg-neutral-800/60",
    text: "text-neutral-500",
    label: "Pending",
  },
  SCHEDULED: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = (statusFilter?: string) => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter as any } : undefined;
    trpc.job.listForCustomer
      .query(params)
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs(filter || undefined);
  }, [filter]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAcceptBid = async (bidId: string, jobId: string) => {
    setActionLoading(bidId);
    try {
      await trpc.bid.accept.mutate({ bidId, jobId });
      toast.success("Bid accepted! The provider can now schedule your job.");
      fetchJobs(filter || undefined);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept bid");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineBid = async (bidId: string, jobId: string) => {
    setActionLoading(bidId);
    try {
      await trpc.bid.decline.mutate({ bidId, jobId });
      toast.success("Bid declined");
      fetchJobs(filter || undefined);
    } catch (err: any) {
      toast.error(err.message || "Failed to decline bid");
    } finally {
      setActionLoading(null);
    }
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
              : "Request a job from the home page to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
            const dot = STATUS_DOT[job.status] || STATUS_DOT.PENDING;
            const isOpen = expanded.has(job.id);
            const bidCount = job.bids?.length || 0;
            const pendingBids = job.bids?.filter((b: any) => b.status === "PENDING") || [];
            const hasDetails =
              job.status === "OPEN" ||
              job.scheduledDate ||
              job.completedAt ||
              job.assignments?.length > 0 ||
              (job.recurringSchedule && job.recurringSchedule.active) ||
              job.acceptedBid;

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
                        {job.service.name}
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
                      {job.type === "SUBSCRIPTION" && (
                        <Badge
                          variant="secondary"
                          className="rounded-full border-0 text-[10px] bg-purple-500/10 text-purple-500"
                        >
                          Sub
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 truncate">
                      {job.property.address}, {job.property.city}
                      {job.status === "OPEN" && bidCount > 0 && (
                        <span className="ml-2 text-cyan-500 font-medium">
                          · {bidCount} bid{bidCount > 1 ? "s" : ""}
                        </span>
                      )}
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
                      {/* Bids section for OPEN jobs */}
                      {job.status === "OPEN" && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                            {pendingBids.length > 0
                              ? `${pendingBids.length} pending bid${pendingBids.length > 1 ? "s" : ""}`
                              : "No bids yet — providers will be notified"}
                          </div>
                          {pendingBids.map((bid: any) => (
                            <div
                              key={bid.id}
                              className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                  <span className="text-xs font-medium text-neutral-900 dark:text-white">
                                    {bid.provider.businessName}
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                  ${Number(bid.price).toFixed(2)}
                                </span>
                              </div>
                              {bid.notes && (
                                <p className="text-xs text-neutral-500">
                                  {bid.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptBid(bid.id, job.id);
                                  }}
                                  disabled={actionLoading === bid.id}
                                  className="h-7 rounded-full bg-green-500 hover:bg-green-400 text-xs flex-1"
                                >
                                  <Check className="w-3 h-3" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeclineBid(bid.id, job.id);
                                  }}
                                  disabled={actionLoading === bid.id}
                                  className="h-7 rounded-full text-xs flex-1"
                                >
                                  <X className="w-3 h-3" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Accepted bid / provider */}
                      {job.acceptedBid && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span>
                            {job.acceptedBid.provider.businessName}
                            <span className="ml-1 font-medium text-neutral-900 dark:text-white">
                              · ${Number(job.acceptedBid.price).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* property */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>
                          {job.property.address}, {job.property.city},{" "}
                          {job.property.state} {job.property.zip}
                        </span>
                      </div>

                      {/* customer notes */}
                      {job.customerNotes && (
                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">Your notes:</span>{" "}
                          {job.customerNotes}
                        </div>
                      )}

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
