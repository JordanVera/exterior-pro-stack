import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/customer', '/provider', '/api/'],
    },
    sitemap: 'https://exteriorpro.app/sitemap.xml',
  };
}
