"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../lib/trpc";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpc.admin.getStats
      .query()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading stats...</div>;
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, color: "text-gray-900" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, color: "text-blue-600" },
    { label: "Providers", value: stats?.totalProviders ?? 0, color: "text-green-600" },
    { label: "Verified Providers", value: stats?.verifiedProviders ?? 0, color: "text-green-700" },
    { label: "Total Jobs", value: stats?.totalJobs ?? 0, color: "text-gray-900" },
    { label: "Active Jobs", value: stats?.activeJobs ?? 0, color: "text-blue-600" },
    { label: "Completed Jobs", value: stats?.completedJobs ?? 0, color: "text-green-600" },
    { label: "Total Quotes", value: stats?.totalQuotes ?? 0, color: "text-gray-900" },
    { label: "Pending Quotes", value: stats?.pendingQuotes ?? 0, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        <p className="text-gray-500 mt-1">Key metrics across the platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
