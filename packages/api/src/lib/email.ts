import chalk from 'chalk';

const DEFAULT_FROM = 'Exterior Pro <noreply@exteriorpro.app>';

/** Matches apps/web brand tokens (navy, neon lime, cream). */
const BRAND = {
  navy: '#0B1F33',
  lime: '#C8F542',
  ink: '#0A1208',
  mist: '#F3EBDD',
  card: '#FFFCF6',
  muted: '#6D5D54',
} as const;

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function siteHost(appUrl: string) {
  try {
    return new URL(appUrl).host.replace(/^www\./, '');
  } catch {
    return appUrl.replace(/^https?:\/\//, '');
  }
}

function verificationEmailHtml(opts: {
  code: string;
  ttlMinutes: number;
  appUrl: string;
}) {
  const { ttlMinutes, appUrl } = opts;
  const code = escapeHtml(opts.code);
  const host = escapeHtml(siteHost(appUrl));
  const logoUrl = `${appUrl}/logos/logo-stacked-lime.png`;
  const digitCells = opts.code
    .split('')
    .map((digit, i, digits) => {
      const box = `<td align="center" valign="middle" width="44" style="width:44px;background-color:${BRAND.mist};border:1px solid #e4d8c6;border-radius:8px;padding:12px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:700;color:${BRAND.navy};">${escapeHtml(digit)}</td>`;
      if (i === digits.length - 1) return box;
      const gap = i === 2 ? 12 : 6;
      return `${box}<td width="${gap}" style="width:${gap}px;font-size:0;line-height:0;">&nbsp;</td>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Your Exterior Pro verification code</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.mist};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your Exterior Pro verification code is ${code}. It expires in ${ttlMinutes} minutes.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.mist};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background-color:${BRAND.card};border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(11,31,51,0.08);">
          <tr>
            <td align="center" bgcolor="${BRAND.navy}" style="background-color:${BRAND.navy};padding:28px 32px 24px;">
              <a href="${escapeHtml(appUrl)}" style="text-decoration:none;">
                <img src="${escapeHtml(logoUrl)}" width="168" height="78" alt="Exterior Pro" style="display:block;border:0;width:168px;height:78px;" />
              </a>
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.lime}" style="background-color:${BRAND.lime};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${BRAND.navy};">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.muted};">Sign in</p>
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:700;color:${BRAND.navy};">Your verification code</h1>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:${BRAND.muted};">
                Use this code to finish signing in to Exterior Pro. It expires in ${ttlMinutes} minutes.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
                <tr>
                  ${digitCells}
                </tr>
              </table>
              <p style="margin:0 0 28px;font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                Enter it on the sign-in page. Do not share this code with anyone.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" bgcolor="${BRAND.lime}" style="background-color:${BRAND.lime};border-radius:999px;">
                    <a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:700;color:${BRAND.ink};text-decoration:none;">
                      Go to Exterior Pro
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:${BRAND.muted};text-align:center;">
                If you didn&apos;t request this, you can ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.navy}" style="background-color:${BRAND.navy};padding:20px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:rgba(243,235,221,0.7);text-align:center;">
                <a href="${escapeHtml(appUrl)}" style="color:${BRAND.lime};text-decoration:none;font-weight:600;">${host}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

  if (process.env.NODE_ENV === 'development' || !apiKey || !opts.to) {
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
  const appUrl = getAppUrl();
  await sendEmail({
    to: opts.to,
    subject: `${opts.code} is your Exterior Pro verification code`,
    text: `${opts.code} is your Exterior Pro verification code. It expires in ${opts.ttlMinutes} minutes.\n\nIf you didn't request this, you can ignore this email.\n\n${appUrl}`,
    html: verificationEmailHtml({
      code: opts.code,
      ttlMinutes: opts.ttlMinutes,
      appUrl,
    }),
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
