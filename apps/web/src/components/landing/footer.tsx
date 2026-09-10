import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { BrandLogo } from '@/components/brand-logo';
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_HOMEOWNER_LINKS,
  FOOTER_PROVIDER_LINKS,
} from './data';

const COLUMNS = [
  { heading: 'For homeowners', links: FOOTER_HOMEOWNER_LINKS },
  { heading: 'For providers', links: FOOTER_PROVIDER_LINKS },
  { heading: 'Company', links: FOOTER_COMPANY_LINKS },
];

export function LandingFooter() {
  return (
    <footer className="py-14 border-t border-border">
      <div className="px-6 mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <BrandLogo width={110} height={42} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Recurring plans and on-demand jobs for everything outside your
              walls. We serve Greater Houston — Heights, Inner Loop, Katy, and
              the surrounding metro.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {column.heading}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mt-12" />

        <div className="flex flex-col gap-3 justify-between items-center pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Exterior Pro. All rights reserved.
          </p>
          <p>
            Exterior Pro is the merchant of record. Providers are independent
            contractors.
          </p>
        </div>
      </div>
    </footer>
  );
}
