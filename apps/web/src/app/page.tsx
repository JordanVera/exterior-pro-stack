import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/landing-page';
import { AuthRedirect } from '@/components/landing/auth-redirect';

const title = 'Exterior Pro — Recurring exterior care and on-demand pros';
const description =
  'Subscribe to recurring lawn, gutter, and exterior care, or post a one-time job and let verified local providers compete for it. Built only for exterior work.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'lawn care subscription',
    'exterior home services',
    'gutter cleaning',
    'pressure washing',
    'landscaping marketplace',
    'contractor bidding',
  ],
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'Exterior Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <LandingPage />
    </>
  );
}
