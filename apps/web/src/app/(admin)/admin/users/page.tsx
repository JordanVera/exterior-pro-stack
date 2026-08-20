'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { Search, Users } from 'lucide-react';
import { StatusBadge } from '../_components/status-badge';
import { displayName, formatDate } from '../_components/utils';

type RoleFilter = 'all' | 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | 'CREW';

type AdminUser = {
  id: string;
  email: string;
  phone: string | null;
  role: string | null;
  verified: boolean;
  createdAt: string | Date;
  customerProfile: { firstName: string; lastName: string } | null;
  providerProfile: { businessName: string } | null;
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = (cursor?: string) => {
    setLoading(true);
    trpc.admin.listUsers
      .query({
        limit: 20,
        ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(cursor ? { cursor } : {}),
      })
      .then((data) => {
        setItems(
          cursor
            ? [...items, ...(data.items as AdminUser[])]
            : (data.items as AdminUser[]),
        );
        setNextCursor(data.nextCursor);
      })
      .catch((err) => toast.error(err.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, debouncedSearch]);

  const handleToggle = async (user: AdminUser) => {
    try {
      await trpc.admin.toggleUserVerification.mutate({
        userId: user.id,
        verified: !user.verified,
      });
      toast.success(user.verified ? 'User suspended' : 'User verified');
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Directory"
        title="Users"
        subtitle="Search accounts, filter by role, and verify or suspend access."
        size="md"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'CUSTOMER', label: 'Customers' },
            { value: 'PROVIDER', label: 'Providers' },
            { value: 'ADMIN', label: 'Admins' },
            { value: 'CREW', label: 'Crew' },
          ]}
        />
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or phone"
            className="pl-9"
          />
        </div>
      </div>

      <SectionPanel title="Accounts" count={items.length} bare>
        <div className="overflow-x-auto rounded-2xl border backdrop-blur-xl border-border bg-background/70">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Verified
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Joined
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-mono text-xs text-foreground hover:text-brand-navy dark:hover:text-brand-lime"
                    >
                      {user.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={user.role} kind="role" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {displayName(user)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.verified
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-500'
                      }
                    >
                      {user.verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(user)}
                        className={
                          user.verified ? 'text-red-500' : 'text-green-600'
                        }
                      >
                        {user.verified ? 'Suspend' : 'Verify'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : null}
          {!loading && items.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try a different role or search."
            />
          ) : null}
        </div>
      </SectionPanel>

      {nextCursor ? (
        <Button variant="outline" onClick={() => fetchUsers(nextCursor)}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}
