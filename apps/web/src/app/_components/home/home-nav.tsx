'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export function HomeNav() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-lg bg-background/80">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
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
            width={84}
            height={32}
          />
        </Link>
        <div className="items-center hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a
            href="#plans"
            className="transition-colors hover:text-foreground"
          >
            Plans
          </a>
          <a
            href="#services"
            className="transition-colors hover:text-foreground"
          >
            Services
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How It Works
          </a>
          <a
            href="#providers"
            className="transition-colors hover:text-foreground"
          >
            For Providers
          </a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>
          <Button
            onClick={() => router.push('/login')}
            className="text-black bg-cyan-500 hover:bg-cyan-700"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}
