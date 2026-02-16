"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../../lib/trpc";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Check,
  X,
  ChevronRight,
  Building2,
  MapPin,
  MessageSquare,
} from "lucide-react";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: {
    bg: "bg-neutral-100 dark:bg-neutral-800/60",
    text: "text-neutral-500",
    label: "Pending",
  },
  SENT: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    label: "Received",
  },
  ACCEPTED: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    label: "Accepted",
  },
  DECLINED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Declined",
  },
  EXPIRED: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    label: "Expired",
  },
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineId, setDeclineId] = useState<string | null>(null);

  const fetchQuotes = () => {
    trpc.quote.listForCustomer
      .query()
      .then(setQuotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleAccept = async (quoteId: string) => {
    try {
      await trpc.quote.updateStatus.mutate({
        quoteId,
        status: "ACCEPTED",
      });
      fetchQuotes();
    } catch (err: any) {
      alert(err.message || "Failed to accept quote");
    }
  };

  const openDecline = (quoteId: string) => {
    setDeclineId(quoteId);
    setDeclineOpen(true);
  };

  const confirmDecline = async () => {
    if (!declineId) return;
    try {
      await trpc.quote.updateStatus.mutate({
        quoteId: declineId,
        status: "DECLINED",
      });
      fetchQuotes();
    } catch (err: any) {
      alert(err.message || "Failed to decline quote");
    }
    setDeclineOpen(false);
    setDeclineId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Quotes
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {quotes.length} total &middot;{" "}
          {quotes.filter((q) => q.status === "SENT").length} awaiting response
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-neutral-100 dark:bg-neutral-800/60">
            <FileText className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-neutral-900 dark:text-white">
            No quotes yet
          </h3>
          <p className="mb-4 text-sm text-neutral-500">
            Request your first quote from the home page.
          </p>
          <Button
            onClick={() => router.push("/customer")}
            className="rounded-full bg-cyan-500 hover:bg-cyan-400"
          >
            Get a Quote
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => {
            const status =
              STATUS_STYLES[quote.status] || STATUS_STYLES.PENDING;
            const price = quote.customPrice
              ? `$${Number(quote.customPrice).toFixed(2)}`
              : `$${Number(quote.service.basePrice).toFixed(2)}`;

            return (
              <Card key={quote.id} className="overflow-hidden shadow-none">
                <CardContent className="p-5">
                  {/* header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold truncate text-neutral-900 dark:text-white">
                          {quote.service.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full border-0 text-[10px] uppercase tracking-wide",
                            status.bg,
                            status.text
                          )}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {quote.service.category.name}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-3 text-right">
                      <div
                        className={cn(
                          "text-lg font-bold",
                          quote.customPrice
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-400"
                        )}
                      >
                        {price}
                      </div>
                      {!quote.customPrice && (
                        <div className="text-[10px] text-neutral-400">
                          base price
                        </div>
                      )}
                    </div>
                  </div>

                  {/* details */}
                  <div className="space-y-2 text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">
                        {quote.property.address}, {quote.property.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span>{quote.provider.businessName}</span>
                    </div>
                    {quote.customerNotes && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {quote.customerNotes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* provider notes */}
                  {quote.notes && (
                    <div className="p-3 mt-3 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium">Provider note:</span>{" "}
                      {quote.notes}
                    </div>
                  )}

                  {/* job status */}
                  {quote.job && (
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          quote.job.status === "COMPLETED"
                            ? "bg-green-500"
                            : quote.job.status === "IN_PROGRESS"
                              ? "bg-amber-500"
                              : "bg-cyan-500"
                        )}
                      />
                      <span className="text-neutral-500">
                        Job: {quote.job.status.replace("_", " ")}
                        {quote.job.scheduledDate &&
                          ` · ${new Date(
                            quote.job.scheduledDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`}
                      </span>
                    </div>
                  )}
                </CardContent>

                {/* action bar */}
                {quote.status === "SENT" && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 px-5 py-3">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(quote.id)}
                        className="flex-1 bg-green-500 rounded-full hover:bg-green-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDecline(quote.id)}
                        className="flex-1 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Decline confirmation dialog */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this quote? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeclineOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDecline}>
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
