import { Resend } from 'resend';
import chalk from 'chalk';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromAddress =
  process.env.RESEND_FROM ||
  process.env.RESEND_FROM_EMAIL ||
  'Exterior Pro <noreply@exteriorpro.app>';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!resend || !opts.to) {
    console.log(
      chalk.cyan(
        `${chalk.red('[email:skipped]')} ${chalk.yellow(opts.subject)} → ${opts.to}`,
      ),
    );
    if (opts.text) console.log(opts.text);
    return;
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? `<p>${opts.text}</p>`,
    });
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
