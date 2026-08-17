import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromAddress =
  process.env.RESEND_FROM ||
  process.env.RESEND_FROM_EMAIL ||
  "Exterior Pro <noreply@exteriorpro.app>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!resend || !opts.to) {
    if (!resend) {
      console.log(`[email:skipped] ${opts.subject} → ${opts.to}`);
    }
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
    console.error("Failed to send email:", err);
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
  const receiptLine = opts.receiptUrl
    ? `\nReceipt: ${opts.receiptUrl}`
    : "";
  await sendEmail({
    to: opts.to,
    subject: `Payment received — ${opts.description}`,
    text: `Hi ${opts.name},\n\nWe received your payment of ${amount} for ${opts.description}.${receiptLine}\n\nThank you,\nExterior Pro`,
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
