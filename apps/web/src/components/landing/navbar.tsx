'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { loginPath } from '@/lib/auth-intent';

const NAV_LINKS = [
  { href: '#plans', label: 'For homeowners' },
  { href: '#providers', label: 'For providers' },
  { href: '#how-it-works', label: 'How it works' },
];

export function LandingNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-brand-navy/70">
        <Link href="/" className="flex gap-2 items-center pl-1">
          <Image
            src="/logos/logo-stacked.png"
            alt="Exterior Pro"
            width={84}
            height={32}
            priority
          />
        </Link>

        <div className="hidden gap-1 items-center md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={() => router.push(loginPath())}
            className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Button>
          <Button
            onClick={() => router.push(loginPath())}
            className="hidden h-9 rounded-full bg-brand-lime px-4 text-sm font-semibold text-brand-ink hover:bg-brand-lime/90 sm:inline-flex"
          >
            Get started
          </Button>
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Button
            className="mt-2 w-full rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
            onClick={() => router.push(loginPath())}
          >
            Get started
          </Button>
        </div>
      ) : null}
    </header>
  );
}
