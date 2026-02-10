"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../lib/trpc";

export default function CustomerDashboard() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([trpc.quote.listForCustomer.query(), trpc.job.listForCustomer.query()])
      .then(([q, j]) => { setQuotes(q); setJobs(j); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => ["SCHEDULED", "IN_PROGRESS"].includes(j.status));
  const pendingQuotes = quotes.filter((q) => q.status === "SENT");

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Pending Quotes</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pendingQuotes.length}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Active Jobs</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeJobs.length}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Completed Jobs</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{jobs.filter((j) => j.status === "COMPLETED").length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => router.push("/customer/services")} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all text-left">
          <div className="text-2xl mb-2">🔧</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Browse Services</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Find and request quotes for exterior services</p>
        </button>
        <button onClick={() => router.push("/customer/properties")} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all text-left">
          <div className="text-2xl mb-2">📍</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Manage Properties</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Add or update your property information</p>
        </button>
      </div>

      {activeJobs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Jobs</h3>
          <div className="space-y-3">
            {activeJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{job.quote.service.name}</div>
                  <div className="text-sm text-gray-500 dark:text-neutral-400">{job.quote.property.address}, {job.quote.property.city}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === "SCHEDULED"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {job.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
