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
    Promise.all([
      trpc.provider.getDashboardStats.query(),
      trpc.job.getUpcoming.query(),
    ])
      .then(([s, u]) => {
        setStats(s);
        setUpcoming(u);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Your business at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-500">Pending Quotes</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">
            {stats?.pendingQuotes ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-500">Active Jobs</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {stats?.activeJobs ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-500">Completed Jobs</div>
          <div className="text-3xl font-bold text-green-600 mt-1">
            {stats?.completedJobs ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-500">Crews</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.totalCrews ?? 0}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/provider/quotes")}
          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all text-left"
        >
          <div className="text-xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900">Review Quotes</h3>
          <p className="text-sm text-gray-500 mt-1">
            Respond to pending quote requests
          </p>
        </button>
        <button
          onClick={() => router.push("/provider/jobs")}
          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="text-xl mb-2">📋</div>
          <h3 className="font-semibold text-gray-900">Manage Jobs</h3>
          <p className="text-sm text-gray-500 mt-1">
            Schedule and dispatch crews
          </p>
        </button>
        <button
          onClick={() => router.push("/provider/crews")}
          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left"
        >
          <div className="text-xl mb-2">👷</div>
          <h3 className="font-semibold text-gray-900">Manage Crews</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add crews and team members
          </p>
        </button>
      </div>

      {/* Upcoming jobs */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Upcoming Jobs (Next 7 Days)
          </h3>
          <div className="space-y-3">
            {upcoming.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {job.quote.service.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {job.quote.property.address}, {job.quote.property.city}
                  </div>
                  {job.assignments.length > 0 && (
                    <div className="text-sm text-gray-400">
                      Crew: {job.assignments.map((a: any) => a.crew.name).join(", ")}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {job.scheduledDate
                      ? new Date(job.scheduledDate).toLocaleDateString()
                      : "Not scheduled"}
                  </div>
                  {job.scheduledTime && (
                    <div className="text-sm text-gray-500">
                      {job.scheduledTime}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
