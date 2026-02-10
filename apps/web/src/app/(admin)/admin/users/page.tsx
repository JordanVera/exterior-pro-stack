"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function AdminUsersPage() {
  const [data, setData] = useState<{ items: any[]; nextCursor?: string }>({
    items: [],
  });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");

  const fetchUsers = (cursor?: string) => {
    setLoading(true);
    const params: any = { limit: 20 };
    if (roleFilter) params.role = roleFilter;
    if (cursor) params.cursor = cursor;

    trpc.admin.listUsers
      .query(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleVerification = async (userId: string, current: boolean) => {
    try {
      await trpc.admin.toggleUserVerification.mutate({
        userId,
        verified: !current,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-gray-500 mt-1">Manage platform users</p>
      </div>

      <div className="flex gap-2">
        {["", "CUSTOMER", "PROVIDER", "ADMIN"].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              roleFilter === role
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {role || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name / Business</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Verified</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">
                  {user.phone}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "PROVIDER"
                        ? "bg-green-100 text-green-700"
                        : user.role === "CUSTOMER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.role || "NONE"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {user.customerProfile
                    ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`
                    : user.providerProfile
                    ? user.providerProfile.businessName
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  {user.verified ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      handleToggleVerification(user.id, user.verified)
                    }
                    className={`text-xs font-medium ${
                      user.verified
                        ? "text-red-600 hover:text-red-700"
                        : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    {user.verified ? "Suspend" : "Verify"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        )}
        {!loading && data.items.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found.</div>
        )}
      </div>

      {data.nextCursor && (
        <button
          onClick={() => fetchUsers(data.nextCursor)}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Load more
        </button>
      )}
    </div>
  );
}
