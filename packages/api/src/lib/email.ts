import chalk from 'chalk';

const DEFAULT_FROM = 'Exterior Pro <noreply@exteriorpro.app>';

function parseSender(raw: string): { name?: string; email: string } {
  const match = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    const name = match[1].trim();
    const email = match[2].trim();
    return name ? { name, email } : { email };
  }
  return { email: raw.trim() };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || !opts.to) {
    console.log(
      chalk.cyan(
        `${chalk.red('[email:skipped]')} ${chalk.yellow(opts.subject)} → ${opts.to}`,
      ),
    );
    if (opts.text) console.log(opts.text);
    return;
  }

  const sender = parseSender(process.env.BREVO_FROM || DEFAULT_FROM);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: opts.to }],
        subject: opts.subject,
        textContent: opts.text,
        htmlContent: opts.html ?? `<p>${opts.text}</p>`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `Failed to send email: Brevo ${response.status} ${response.statusText}`,
        body,
      );
    }
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

export async function sendPaymentReceiptEmail(opts: {
  to: string;
  name: string;
  description: string;
  amountCents: number;
  receiptUrl?: string | null;
}) {
  const amount = `$${(opts.amountCents / 100).toFixed(2)}`;
  const receiptLine = opts.receiptUrl ? `\nReceipt: ${opts.receiptUrl}` : '';
  await sendEmail({
    to: opts.to,
    subject: `Payment received — ${opts.description}`,
    text: `Hi ${opts.name},\n\nWe received your payment of ${amount} for ${opts.description}.${receiptLine}\n\nThank you,\nExterior Pro`,
  });
}

export async function sendVerificationEmail(opts: {
  to: string;
  code: string;
  ttlMinutes: number;
}) {
  await sendEmail({
    to: opts.to,
    subject: `${opts.code} is your Exterior Pro verification code`,
    text: `${opts.code} is your Exterior Pro verification code. It expires in ${opts.ttlMinutes} minutes. If you didn't request this, you can ignore this email.`,
    html: `<p>Your Exterior Pro verification code is:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:0.2em">${opts.code}</p>
<p>It expires in ${opts.ttlMinutes} minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}

export async function sendJobConfirmationEmail(opts: {
  to: string;
  name: string;
  serviceName: string;
  address: string;
}) {
  await sendEmail({
    to: opts.to,
    subject: `Job confirmed — ${opts.serviceName}`,
    text: `Hi ${opts.name},\n\nYour ${opts.serviceName} job at ${opts.address} is confirmed. The provider will schedule a visit next.\n\nExterior Pro`,
  });
}
