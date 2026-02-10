"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300",
  SCHEDULED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const params = filter ? { status: filter as any } : undefined;
    trpc.job.listForCustomer.query(params).then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Jobs</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Track the status of your jobs</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setLoading(true); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === status
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
            }`}
          >
            {status ? status.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{job.quote.service.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status] || "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300"}`}>
                    {job.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                  {job.quote.property.address}, {job.quote.property.city}, {job.quote.property.state}
                </p>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Provider: {job.quote.provider.businessName}</p>
              </div>
              {job.quote.customPrice && <div className="text-xl font-bold text-gray-900 dark:text-white">${Number(job.quote.customPrice).toFixed(2)}</div>}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-neutral-400">
              {job.scheduledDate && <div>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}{job.scheduledTime && ` at ${job.scheduledTime}`}</div>}
              {job.completedAt && <div>Completed: {new Date(job.completedAt).toLocaleDateString()}</div>}
              {job.assignments.length > 0 && <div>Crew: {job.assignments.map((a: any) => a.crew.name).join(", ")}</div>}
            </div>

            {job.recurringSchedule && job.recurringSchedule.active && (
              <div className="mt-3 p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-sm text-purple-700 dark:text-purple-400">
                Recurring: {job.recurringSchedule.frequency} &middot; Next: {new Date(job.recurringSchedule.nextDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}

        {jobs.length === 0 && <div className="text-center py-12 text-gray-500 dark:text-neutral-400">No jobs found.</div>}
      </div>
    </div>
  );
}
