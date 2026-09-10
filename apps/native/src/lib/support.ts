import { getBaseUrl } from './trpc';

export const SUPPORT_EMAIL = 'support@exteriorpro.app';
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

export function legalUrl(path: '/privacy' | '/terms' | '/contractor-agreement') {
  return `${getBaseUrl()}${path}`;
}
