import chalk from 'chalk';
import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn(
      'Twilio credentials not configured. SMS will be logged to console.',
    );
    return null;
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

export async function sendSMS(to: string, body: string): Promise<void> {
  const client = getClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !fromNumber) {
    // Dev fallback: log to console. Colour is applied here rather than to the
    // body itself, so real messages never carry ANSI escape codes.
    console.log(
      `${chalk.cyanBright.bold(`[SMS → ${to}]`)}: ${chalk.yellowBright(body)}`,
    );
    return;
  }

  await client.messages.create({
    body,
    from: fromNumber,
    to,
  });
}

export function generateVerificationCode(): string {
  // Use crypto.randomInt when available (Node.js), otherwise fall back to Math.random
  // This ensures compatibility with both server and client builds
  if (typeof crypto !== 'undefined' && 'randomInt' in crypto) {
    // Node.js crypto
    const cryptoModule = require('node:crypto');
    return cryptoModule.randomInt(100000, 1000000).toString();
  }
  // Fallback for browser/build-time evaluation
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}
