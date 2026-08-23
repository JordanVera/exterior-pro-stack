'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';
import { loginPath } from '@/lib/auth-intent';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#services', label: 'Services' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#providers', label: 'For providers' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
      <nav
        className={cn(
          'mx-auto flex items-center justify-between rounded-full border px-3 py-2 transition-all duration-300 sm:px-4',
          scrolled
            ? 'max-w-5xl border-white/10 bg-background/80 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-black/70'
            : 'max-w-6xl border-transparent bg-transparent',
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2 pl-1">
          <BrandLogo width={84} height={32} priority onDark={!scrolled} />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'group relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                scrolled
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-white/80 hover:text-white',
              )}
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-0.5 h-px scale-x-0 bg-brand-lime transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle
            className={
              scrolled
                ? undefined
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }
          />
          <Link
            href={loginPath()}
            className={cn(
              'hidden rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:block',
              scrolled
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-white/80 hover:text-white',
            )}
          >
            Sign in
          </Link>
          <Link
            href={loginPath('customer')}
            className="group hidden items-center gap-1.5 rounded-full bg-brand-lime px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-lime/90 sm:inline-flex"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full lg:hidden',
              scrolled ? 'text-foreground' : 'text-white',
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-background/95 p-4 shadow-xl backdrop-blur-xl lg:hidden dark:bg-black/90"
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition hover:bg-brand-lime/10"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-3 grid gap-2 border-t border-border pt-3">
              <Link
                href={loginPath('customer')}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-brand-lime px-4 py-3 text-center text-sm font-semibold text-brand-ink"
              >
                Get my property handled
              </Link>
              <Link
                href={loginPath('provider')}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-brand-lime/30 px-4 py-3 text-center text-sm font-semibold text-foreground"
              >
                Join as a provider
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
