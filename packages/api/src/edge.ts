/**
 * Edge Runtime compatible exports
 * 
 * This file only exports functions that are safe to use in Edge Runtime (middleware).
 * It doesn't import SuperJSON or any Node.js specific modules.
 */

export { verifyToken } from './lib/jwt';
export type { UserRole } from '@repo/db';
