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

export default function AdminJobsPage() {
  const [data, setData] = useState<{ items: any[]; nextCursor?: string }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchJobs = (cursor?: string) => {
    setLoading(true);
    const params: any = { limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (cursor) params.cursor = cursor;
    trpc.admin.listJobs.query(params).then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Jobs</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Platform-wide job oversight</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
          <button key={status} onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === status
                ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white"
                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
            }`}
          >{status ? status.replace("_", " ") : "All"}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Service</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Property</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Provider</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Scheduled</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
            {data.items.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-neutral-950">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{job.quote.service.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">{job.quote.property.address}, {job.quote.property.city}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">{job.quote.provider.businessName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[job.status]}`}>{job.status.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-neutral-400">{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{job.quote.customPrice ? `$${Number(job.quote.customPrice).toFixed(2)}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="text-center py-8 text-gray-500 dark:text-neutral-400">Loading...</div>}
        {!loading && data.items.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-neutral-400">No jobs found.</div>}
      </div>

      {data.nextCursor && (
        <button onClick={() => fetchJobs(data.nextCursor)} className="px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">Load more</button>
      )}
    </div>
  );
}
