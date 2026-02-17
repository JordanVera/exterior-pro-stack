"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";
import { toast } from "sonner";

export default function AvailableJobsPage() {
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [biddingJobId, setBiddingJobId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    Promise.all([
      trpc.job.listOpen.query(),
      trpc.job.listMyBids.query(),
    ])
      .then(([jobs, bids]) => {
        setOpenJobs(jobs);
        setMyBids(bids);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitBid = async (jobId: string) => {
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    setSubmitting(true);
    try {
      await trpc.bid.submit.mutate({
        jobId,
        price: Number(price),
        notes: notes || undefined,
      });
      toast.success("Bid submitted successfully!");
      setBiddingJobId(null);
      setPrice("");
      setNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    try {
      await trpc.bid.withdraw.mutate({ bidId });
      toast.success("Bid withdrawn");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw bid");
    }
  };

  const inputClass =
    "block rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none";

  if (loading) {
    return (
      <div className="text-gray-500 dark:text-neutral-400">
        Loading available jobs...
      </div>
    );
  }

  const pendingBids = myBids.filter((b) => b.status === "PENDING");
  const acceptedBids = myBids.filter((b) => b.status === "ACCEPTED");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Available Jobs
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">
          Browse open job requests in your service area and submit bids
        </p>
      </div>

      {/* Open Jobs */}
      {openJobs.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-3">
            Open Jobs ({openJobs.length})
          </h3>
          <div className="space-y-4">
            {openJobs.map((job) => {
              const bidCount = job.bids?.length || 0;
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {job.service.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                          OPEN
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                        {job.property.address}, {job.property.city},{" "}
                        {job.property.state} {job.property.zip}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        Base price: $
                        {Number(job.service.basePrice).toFixed(2)}/
                        {job.service.unit === "SQFT"
                          ? "sq ft"
                          : job.service.unit === "HOUR"
                            ? "hr"
                            : "flat"}
                      </p>
                      {job.customerNotes && (
                        <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2">
                          Customer notes: {job.customerNotes}
                        </p>
                      )}
                      {bidCount > 0 && (
                        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                          {bidCount} bid{bidCount > 1 ? "s" : ""} already
                          submitted
                        </p>
                      )}
                    </div>
                  </div>

                  {biddingJobId === job.id ? (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                          Your Price *
                        </label>
                        <div className="flex items-center">
                          <span className="text-gray-500 dark:text-neutral-400 mr-1">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`${inputClass} w-40`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className={`${inputClass} w-full resize-none`}
                          placeholder="Details about your bid, timeline, approach..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitBid(job.id)}
                          disabled={submitting}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit Bid"}
                        </button>
                        <button
                          onClick={() => {
                            setBiddingJobId(null);
                            setPrice("");
                            setNotes("");
                          }}
                          className="px-4 py-2 text-gray-600 dark:text-neutral-400 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setBiddingJobId(job.id)}
                      className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Submit a Bid
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
          No open jobs in your service area right now. Check back soon!
        </div>
      )}

      {/* My Pending Bids */}
      {pendingBids.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
            My Pending Bids ({pendingBids.length})
          </h3>
          <div className="space-y-3">
            {pendingBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-orange-200 dark:border-orange-900 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {bid.job.service.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-neutral-400">
                    {bid.job.property.address}, {bid.job.property.city}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-neutral-300 mt-0.5">
                    Your bid: ${Number(bid.price).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    PENDING
                  </span>
                  <button
                    onClick={() => handleWithdrawBid(bid.id)}
                    className="text-sm text-red-500 hover:text-red-400"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Bids */}
      {acceptedBids.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
            Won Bids ({acceptedBids.length})
          </h3>
          <div className="space-y-3">
            {acceptedBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-green-200 dark:border-green-900 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {bid.job.service.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-neutral-400">
                    {bid.job.property.address}, {bid.job.property.city}
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-400 mt-0.5">
                    Accepted: ${Number(bid.price).toFixed(2)}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  ACCEPTED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
