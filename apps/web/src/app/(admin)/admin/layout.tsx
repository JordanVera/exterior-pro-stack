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
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    trpc.auth.me
      .query()
      .then((u) => {
        if (u.role !== 'ADMIN') {
          router.push('/');
          return;
        }
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await clearToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-mist dark:bg-brand-night">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-mist dark:bg-brand-night">
      <aside className="flex min-h-screen w-64 flex-col border-r border-white/10 bg-brand-navy text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">Exterior Pro</h1>
          <p className="mt-1 text-sm text-white/50">Admin Dashboard</p>
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
                    ? 'bg-brand-lime/15 text-brand-lime'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
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
            className="flex-1 rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
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
