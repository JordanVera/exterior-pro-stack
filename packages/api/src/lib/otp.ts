/** 6-digit numeric OTP. Shared by email (and any future) verification senders. */
export function generateVerificationCode(): string {
  // Use crypto.randomInt when available (Node.js), otherwise fall back to Math.random
  // This ensures compatibility with both server and client builds
  if (typeof crypto !== 'undefined' && 'randomInt' in crypto) {
    const cryptoModule = require('node:crypto');
    return cryptoModule.randomInt(100000, 1000000).toString();
  }
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}
