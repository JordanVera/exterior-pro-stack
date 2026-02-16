'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { trpc } from '../../../lib/trpc';
import { isAuthenticated } from '../../../lib/auth';
import { NotificationBell } from '../../../components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const navItems = [
  { href: '/customer', label: 'Home' },
  { href: '/customer/quotes', label: 'Quotes' },
  { href: '/customer/jobs', label: 'Jobs' },
  { href: '/customer/settings', label: 'Settings' },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    trpc.auth.me
      .query()
      .then((u) => {
        if (u.role !== 'CUSTOMER') {
          router.push('/');
          return;
        }
        setUser(u);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const firstName = user?.customerProfile?.firstName || '';
  const lastName = user?.customerProfile?.lastName || '';
  const initials =
    ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?';

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-black">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-neutral-200/60 dark:border-neutral-800">
        <div className="container flex items-center justify-between px-5 mx-auto h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              {/* <Image
              src="/logos/logo-wide.png"
              alt="Exterior Pro"
              width={200}
              height={80}
            /> */}
              <Image
                src="/logos/logo-stacked.png"
                alt="Exterior Pro"
                width={72}
                height={32}
              />
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/customer' &&
                    pathname?.startsWith(item.href));
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'text-xs font-medium rounded-full px-3.5 h-8',
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:text-cyan-600 dark:hover:text-cyan-400'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200',
                    )}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white text-[11px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container flex-1 w-full px-5 py-6 mx-auto">
        {children}
      </main>
    </div>
  );
}
