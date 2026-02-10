import twilio from "twilio";

let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials not configured. SMS will be logged to console.");
    return null;
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

export async function sendSMS(to: string, body: string): Promise<void> {
  const client = getClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !fromNumber) {
    // Dev fallback: log to console
    console.log(`[SMS → ${to}]: ${body}`);
    return;
  }

  await client.messages.create({
    body,
    from: fromNumber,
    to,
  });
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
