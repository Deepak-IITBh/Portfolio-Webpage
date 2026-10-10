// Sends one real test email through Resend using the key in .env.
// Usage: npm run email:test
const key = process.env.RESEND_API_KEY?.trim();
const to = process.env.CONTACT_TO_EMAIL?.trim() || 'deepakde@iitbhilai.ac.in';
const from = process.env.CONTACT_FROM_EMAIL?.trim() || 'Portfolio <onboarding@resend.dev>';

if (!key) {
  console.error('✗ RESEND_API_KEY is empty. Paste your key into .env (project root) and save: RESEND_API_KEY=re_...');
  process.exit(1);
}

// Same Idempotency-Key on retry, so a retried request can never send a second email.
const idempotencyKey = crypto.randomUUID();
const send = () =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Portfolio contact form: test email',
      text: `If you can read this, the portfolio contact form is configured correctly.\n\nSent at ${new Date().toISOString()}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });

let res;
try {
  res = await send();
} catch (err) {
  console.warn(`… network error (${err.cause?.code ?? err.message}), retrying once`);
  res = await send();
}
const body = await res.json().catch(() => ({}));

if (res.ok) {
  console.log(`✓ Resend accepted the email (id ${body.id}). Check ${to} (and spam) for "Portfolio contact form: test email".`);
} else {
  console.error(`✗ Resend responded ${res.status}: ${body.message ?? JSON.stringify(body)}`);
  if (res.status === 401 || res.status === 400) console.error('  → The API key looks wrong. Create a new one at https://resend.com/api-keys and paste it into .env.');
  if (res.status === 403) console.error(`  → With the test sender (onboarding@resend.dev) Resend only delivers to the email your Resend account was created with.\n    Sign up to Resend with ${to}, or verify your own domain and set CONTACT_FROM_EMAIL.`);
  process.exit(1);
}
