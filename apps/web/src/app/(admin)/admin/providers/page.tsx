"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function AdminProvidersPage() {
  const [data, setData] = useState<{ items: any[]; nextCursor?: string }>({
    items: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchProviders = () => {
    setLoading(true);
    trpc.admin.listUsers
      .query({ role: "PROVIDER", limit: 50 })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerifyProvider = async (providerId: string) => {
    try {
      await trpc.admin.verifyProvider.mutate({ providerId });
      fetchProviders();
    } catch (err: any) {
      alert(err.message || "Failed to verify provider");
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading providers...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Provider Management
        </h2>
        <p className="text-gray-500 mt-1">
          Review and verify service providers
        </p>
      </div>

      <div className="space-y-4">
        {data.items.map((user) => {
          const profile = user.providerProfile;
          if (!profile) return null;

          return (
            <div
              key={user.id}
              className={`bg-white rounded-xl p-5 border ${
                profile.verified ? "border-gray-200" : "border-yellow-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {profile.businessName}
                    </h3>
                    {profile.verified ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Phone: {user.phone}
                  </p>
                  {profile.serviceArea && (
                    <p className="text-sm text-gray-500">
                      Area: {profile.serviceArea}
                    </p>
                  )}
                  {profile.description && (
                    <p className="text-sm text-gray-400 mt-2">
                      {profile.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {!profile.verified && (
                  <button
                    onClick={() => handleVerifyProvider(profile.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {data.items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No providers registered yet.
          </div>
        )}
      </div>
    </div>
  );
}
