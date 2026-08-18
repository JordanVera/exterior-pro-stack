'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { trpc } from '../../../lib/trpc';
import { isAuthenticated } from '../../../lib/auth';
import { NotificationBell } from '../../../components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/provider', label: 'Home' },
  { href: '/provider/quotes', label: 'Available' },
  { href: '/provider/jobs', label: 'Jobs' },
  { href: '/provider/crews', label: 'Crews' },
  { href: '/provider/payouts', label: 'Payouts' },
];

function isNavActive(pathname: string | null, href: string) {
  return (
    pathname === href || (href !== '/provider' && pathname?.startsWith(href))
  );
}

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
        if (u.role !== 'PROVIDER') {
          router.push('/');
          return;
        }
        setUser(u);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const businessName = user?.providerProfile?.businessName || '';
  const initials =
    businessName
      .split(' ')
      .slice(0, 2)
      .map((part: string) => part[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-black/70">
          <div className="flex gap-4 items-center">
            <Link href="/provider" className="flex gap-2 items-center pl-1">
              <Image
                src="/logos/logo-stacked-lime.png"
                alt="Exterior Pro"
                width={84}
                height={32}
                priority
              />
            </Link>
            <div className="hidden gap-1 items-center md:flex">
              {loading
                ? navItems.map((item) => (
                    <Skeleton key={item.href} className="w-14 h-8 rounded-lg" />
                  ))
                : navItems.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'px-3 py-2 text-sm rounded-lg transition-colors',
                          active
                            ? 'text-brand-navy bg-brand-lime/10 dark:text-brand-lime'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {loading ? (
              <>
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </>
            ) : (
              <>
                <NotificationBell />
                <Link href="/provider/profile">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-brand-navy to-brand-lime text-[11px] font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </nav>

        {open ? (
          <div className="p-3 mx-auto mt-2 max-w-6xl rounded-2xl border shadow-xl backdrop-blur-xl border-border bg-background/95 md:hidden">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm',
                    active
                      ? 'bg-brand-lime/10 text-brand-navy dark:text-brand-lime'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </header>

      <div className="min-h-screen bg-background text-foreground">
        <main className="flex-1 px-5 pt-28 pb-16 mx-auto w-full max-w-6xl">
          {loading ? (
            <div className="space-y-10">
              <div className="space-y-2">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </>
  );
}
