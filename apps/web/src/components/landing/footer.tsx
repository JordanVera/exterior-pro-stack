'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FOOTER_HOMEOWNER_LINKS, FOOTER_PROVIDER_LINKS } from './data';

export function LandingFooter() {
  const router = useRouter();
  const goLogin = () => router.push('/login');

  return (
    <footer className="py-12 border-t border-border">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex gap-2 items-center mb-4">
              <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-cyan-600 rounded-lg">
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
              For homeowners
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {FOOTER_HOMEOWNER_LINKS.map((label) => (
                <li key={label}>
                  <Button
                    variant="link"
                    onClick={goLogin}
                    className="p-0 h-auto text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              For providers
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {FOOTER_PROVIDER_LINKS.map((label) => (
                <li key={label}>
                  <Button
                    variant="link"
                    onClick={goLogin}
                    className="p-0 h-auto text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <span className="cursor-default">About</span>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/privacy')}
                  className="p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => router.push('/terms')}
                  className="p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Button>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="mt-12" />
        <div className="pt-8 text-sm text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Exterior Pro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
