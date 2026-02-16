"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../lib/trpc";

export default function ProviderDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([trpc.provider.getDashboardStats.query(), trpc.job.getUpcoming.query()])
      .then(([s, u]) => { setStats(s); setUpcoming(u); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Your business at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Pending Quotes</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats?.pendingQuotes ?? 0}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Active Jobs</div>
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{stats?.activeJobs ?? 0}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Completed Jobs</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats?.completedJobs ?? 0}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800">
          <div className="text-sm text-gray-500 dark:text-neutral-400">Crews</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.totalCrews ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => router.push("/provider/quotes")} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all text-left">
          <div className="text-xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Review Quotes</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Respond to pending quote requests</p>
        </button>
        <button onClick={() => router.push("/provider/jobs")} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm transition-all text-left">
          <div className="text-xl mb-2">📋</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Manage Jobs</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Schedule and dispatch crews</p>
        </button>
        <button onClick={() => router.push("/provider/crews")} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm transition-all text-left">
          <div className="text-xl mb-2">👷</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Manage Crews</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Add crews and team members</p>
        </button>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upcoming Jobs (Next 7 Days)</h3>
          <div className="space-y-3">
            {upcoming.map((job) => (
              <div key={job.id} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{job.quote.service.name}</div>
                  <div className="text-sm text-gray-500 dark:text-neutral-400">{job.quote.property.address}, {job.quote.property.city}</div>
                  {job.assignments.length > 0 && <div className="text-sm text-gray-400 dark:text-neutral-500">Crew: {job.assignments.map((a: any) => a.crew.name).join(", ")}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "Not scheduled"}</div>
                  {job.scheduledTime && <div className="text-sm text-gray-500 dark:text-neutral-400">{job.scheduledTime}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
