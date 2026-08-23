'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { trpc } from '../../../lib/trpc';
import { isAuthenticated, clearSession } from '../../../lib/auth';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/business-plan', label: 'Business plan', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/providers', label: 'Providers', icon: Building2 },
  { href: '/admin/services', label: 'Services', icon: Layers },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/payments', label: 'Payments', icon: Wallet },
];

function isNavActive(pathname: string | null, href: string) {
  return pathname === href || (href !== '/admin' && pathname?.startsWith(href));
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        setEmail(u.email);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-mist dark:bg-brand-night">
        <div className="hidden w-64 border-r border-white/10 bg-brand-navy md:block" />
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  const nav = (
    <nav className="flex-1 px-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-lime/15 text-brand-lime'
                : 'text-white/60 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-brand-mist dark:bg-brand-night print:block print:min-h-0 print:bg-white">
      <aside className="hidden sticky top-0 flex-col w-64 h-screen border-r shrink-0 border-white/10 bg-brand-navy md:flex print:hidden">
        <div className="p-6">
          <Link href="/admin" className="flex gap-2 items-center">
            <BrandLogo width={84} height={32} onDark className="w-auto h-8" />
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
            Admin
          </p>
        </div>
        {nav}
        <div className="p-4 space-y-3 border-t border-white/10">
          <p className="px-1 text-xs truncate text-white/40">{email}</p>
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex-1 justify-start text-white/60 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="flex relative flex-col w-72 h-full bg-brand-navy">
            <div className="flex justify-between items-center p-4">
              <p className="text-sm font-semibold text-white">Admin</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="text-white/70 hover:bg-white/5 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {nav}
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="justify-start w-full text-white/60 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex justify-between items-center px-4 py-3 border-b backdrop-blur-xl border-border bg-background/70 md:hidden print:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold">Admin</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 sm:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
