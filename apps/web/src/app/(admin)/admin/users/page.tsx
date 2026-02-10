"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function AdminUsersPage() {
  const [data, setData] = useState<{ items: any[]; nextCursor?: string }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");

  const fetchUsers = (cursor?: string) => {
    setLoading(true);
    const params: any = { limit: 20 };
    if (roleFilter) params.role = roleFilter;
    if (cursor) params.cursor = cursor;
    trpc.admin.listUsers.query(params).then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleToggleVerification = async (userId: string, current: boolean) => {
    try { await trpc.admin.toggleUserVerification.mutate({ userId, verified: !current }); fetchUsers(); }
    catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Manage platform users</p>
      </div>

      <div className="flex gap-2">
        {["", "CUSTOMER", "PROVIDER", "ADMIN"].map((role) => (
          <button key={role} onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              roleFilter === role
                ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white"
                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
            }`}
          >
            {role || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Name / Business</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Verified</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-neutral-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
            {data.items.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-950">
                <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{user.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : user.role === "PROVIDER" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : user.role === "CUSTOMER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}>{user.role || "NONE"}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                  {user.customerProfile ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}` : user.providerProfile ? user.providerProfile.businessName : "-"}
                </td>
                <td className="px-4 py-3">
                  {user.verified ? <span className="text-green-600 dark:text-green-400">Yes</span> : <span className="text-red-500 dark:text-red-400">No</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-neutral-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleVerification(user.id, user.verified)}
                    className={`text-xs font-medium ${user.verified ? "text-red-600 dark:text-red-400 hover:text-red-700" : "text-green-600 dark:text-green-400 hover:text-green-700"}`}
                  >{user.verified ? "Suspend" : "Verify"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="text-center py-8 text-gray-500 dark:text-neutral-400">Loading...</div>}
        {!loading && data.items.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-neutral-400">No users found.</div>}
      </div>

      {data.nextCursor && (
        <button onClick={() => fetchUsers(data.nextCursor)} className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Load more</button>
      )}
    </div>
  );
}
