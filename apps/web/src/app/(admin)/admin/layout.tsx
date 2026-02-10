'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { trpc } from '../../../lib/trpc';
import { isAuthenticated, clearToken } from '../../../lib/auth';
import { ThemeToggle } from '../../../components/ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👤' },
  { href: '/admin/providers', label: 'Providers', icon: '🔧' },
  { href: '/admin/services', label: 'Services', icon: '📦' },
  { href: '/admin/jobs', label: 'Jobs', icon: '📋' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    trpc.auth.me.query().then((u) => {
      if (u.role !== "ADMIN") { router.push("/"); return; }
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar — always dark for admin */}
      <aside className="flex flex-col w-64 min-h-screen text-white bg-gray-900 border-r border-transparent dark:bg-neutral-950 dark:border-neutral-800">
        <div className="p-6">
          <h1 className="text-xl font-bold">Exterior Pro</h1>
          <p className="mt-1 text-sm text-gray-400">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-700 dark:bg-neutral-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-neutral-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center justify-between p-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-gray-800 dark:hover:bg-neutral-900"
          >
            Sign Out
          </button>
          <ThemeToggle />
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
