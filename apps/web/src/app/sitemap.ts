import type { MetadataRoute } from 'next';

const site = process.env.NEXT_PUBLIC_APP_URL || 'https://exteriorpro.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.replace(/\/$/, '');
  return [
    '',
    '/privacy',
    '/terms',
    '/contractor-agreement',
    '/contact',
  ].map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: new Date(),
  }));
}
