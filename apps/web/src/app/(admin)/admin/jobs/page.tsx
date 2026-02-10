"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminJobsPage() {
  const [data, setData] = useState<{ items: any[]; nextCursor?: string }>({
    items: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchJobs = (cursor?: string) => {
    setLoading(true);
    const params: any = { limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (cursor) params.cursor = cursor;

    trpc.admin.listJobs
      .query(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Jobs</h2>
        <p className="text-gray-500 mt-1">Platform-wide job oversight</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                statusFilter === status
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status ? status.replace("_", " ") : "All"}
            </button>
          )
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Service</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Property</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Provider</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Scheduled</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {job.quote.service.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {job.quote.property.address}, {job.quote.property.city}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {job.quote.provider.businessName}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[job.status]
                    }`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {job.scheduledDate
                    ? new Date(job.scheduledDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {job.quote.customPrice
                    ? `$${Number(job.quote.customPrice).toFixed(2)}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        )}
        {!loading && data.items.length === 0 && (
          <div className="text-center py-8 text-gray-500">No jobs found.</div>
        )}
      </div>

      {data.nextCursor && (
        <button
          onClick={() => fetchJobs(data.nextCursor)}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Load more
        </button>
      )}
    </div>
  );
}
