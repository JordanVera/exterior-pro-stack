'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function HomeFooter() {
  const router = useRouter();

  return (
    <footer className="border-t border-black/[0.06] py-14 dark:border-white/[0.08]">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background dark:bg-white dark:text-black">
                EP
              </div>
              <span className="text-lg font-bold text-foreground">
                Exterior Pro
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The all-in-one platform for exterior property services. Book,
              track, and manage everything from your phone.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              For Homeowners
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Browse Plans
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Request a Job
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  My Properties
                </Button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              For Providers
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Join as Provider
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Manage Crews
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Provider Dashboard
                </Button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-neutral-400">
              <li>
                <span className="cursor-default">About</span>
              </li>
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-12 text-sm text-center border-t text-muted-foreground border-border">
          &copy; {new Date().getFullYear()} Exterior Pro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
