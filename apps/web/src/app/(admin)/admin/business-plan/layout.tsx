import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business plan',
};

export default function BusinessPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
