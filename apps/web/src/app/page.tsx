import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/landing-page';
import { AuthRedirect } from '@/components/landing/auth-redirect';

const title = 'Exterior Pro — Houston exterior care, plans, and local crews';
const description =
  'Greater Houston recurring lawn, gutter, and exterior care — or post a one-time job and let verified local providers bid. Photo proof after every visit.';

export const revalidate = 300;

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
    images: ['/logos/logo-stacked-lime.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/logos/logo-stacked-lime.png'],
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
