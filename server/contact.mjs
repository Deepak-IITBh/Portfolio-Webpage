/**
 * POST /api/contact: emails a contact-form message to Deepak via Resend.
 *
 * Plain Node (no framework) so the same handler runs in `npm run dev` (as a Vite middleware)
 * and in production (server/index.mjs). The Resend key is read from the server environment
 * (RESEND_API_KEY) and is never sent to the browser.
 *
 * Protections: same-host check, body-size cap, field validation, honeypot, per-IP rate limit,
 * HTML escaping, header-injection stripping, request timeout, generic client errors,
 * one network retry with an idempotency key (a retry can never send a duplicate email).
 */
import { randomUUID } from 'node:crypto';

const LIMITS = { name: 80, email: 120, message: 2000 };
const MAX_BODY_BYTES = 16 * 1024;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map();

const MESSAGES = {
  sent: 'Message sent successfully ✓',
  forbidden: 'This form only accepts messages sent from the site itself.',
  too_large: 'That message is too long.',
  unsupported: 'Unsupported request.',
  invalid: 'Please check your name, email and message.',
  rate_limited: 'Too many messages in a short time. Please try again in a few minutes.',
  not_configured: 'The contact form is temporarily unavailable.',
  send_failed: 'Your message could not be sent right now. Please try again shortly.',
  method: 'Method not allowed.',
};
const STATUS = { forbidden: 403, too_large: 413, unsupported: 415, invalid: 400, rate_limited: 429, not_configured: 503, send_failed: 502, method: 405 };

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const oneLine = (s) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();

function requestHost(req) {
  return String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '').split(',')[0].trim();
}

function fromSameSite(req) {
  const source = req.headers.origin ?? req.headers.referer;
  if (!source) return false;
  try {
    return new URL(source).host === requestHost(req);
  } catch {
    return false;
  }
}

/** Behind a proxy (e.g. Render) the last X-Forwarded-For entry is the one the proxy added; earlier entries are client-controlled. */
function clientIp(req) {
  const chain = String(req.headers['x-forwarded-for'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return chain.at(-1) || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  const limited = hits.length >= MAX_PER_WINDOW;
  if (!limited) hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [key, times] of recent) if (times.every((t) => now - t >= WINDOW_MS)) recent.delete(key);
  return limited;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('too large'), { code: 'too_large' });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function htmlPage(ok, text, status) {
  const accent = ok ? '#3fcf86' : '#ff6b6b';
  return {
    status,
    type: 'text/html; charset=utf-8',
    body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${ok ? 'Message sent' : 'Message not sent'} — Deepak</title>
<style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#080807;color:#f1eee8;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:440px;padding:32px;text-align:center}p.s{font-size:1.4rem;font-weight:600;color:${accent};margin:0 0 8px}a{color:#ff9a4a}</style></head>
<body><main><p class="s">${escapeHtml(text)}</p><p><a href="/#contact">← Back to the site</a></p></main></body></html>`,
  };
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Record<string, string | undefined>} env
 */
export async function handleContact(req, res, env) {
  const type = String(req.headers['content-type'] ?? '');
  const isJson = type.includes('application/json');
  const isForm = type.includes('application/x-www-form-urlencoded');
  const dev = env.NODE_ENV !== 'production';

  const reply = (result, extra = {}) => {
    const ok = result === 'sent';
    const status = ok ? 200 : STATUS[result];
    const headers = { 'Cache-Control': 'no-store' };
    if (result === 'rate_limited') headers['Retry-After'] = String(Math.ceil(WINDOW_MS / 1000));
    if (!isJson && isForm) {
      const page = htmlPage(ok, MESSAGES[result], status);
      res.writeHead(page.status, { ...headers, 'Content-Type': page.type });
      return res.end(page.body);
    }
    res.writeHead(status, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok, ...(ok ? {} : { error: result }), message: MESSAGES[result], ...extra }));
  };
  const devDetail = (text) => (dev ? { detail: text } : {});

  if (req.method !== 'POST') return reply('method');
  if (!isJson && !isForm) return reply('unsupported');
  if (!fromSameSite(req)) return reply('forbidden');
  if (Number(req.headers['content-length'] ?? 0) > MAX_BODY_BYTES) return reply('too_large');

  let raw;
  try {
    const text = await readBody(req);
    raw = isJson ? JSON.parse(text) : Object.fromEntries(new URLSearchParams(text));
    if (!raw || typeof raw !== 'object') return reply('invalid');
  } catch (err) {
    return reply(err?.code === 'too_large' ? 'too_large' : 'invalid');
  }
  const field = (k) => (typeof raw[k] === 'string' ? raw[k] : '');

  // Honeypot: real visitors never see this field. Pretend success so bots learn nothing.
  if (field('company').trim()) return reply('sent');

  const name = oneLine(field('name'));
  const email = field('email').trim();
  const message = field('message').replace(/\r\n/g, '\n').trim();
  const invalid = [];
  if (!name || name.length > LIMITS.name) invalid.push('name');
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) invalid.push('email');
  if (!message || message.length > LIMITS.message) invalid.push('message');
  if (invalid.length) return reply('invalid', { fields: invalid });

  if (isRateLimited(clientIp(req))) return reply('rate_limited');

  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set; cannot send messages.');
    return reply('not_configured', devDetail('RESEND_API_KEY is not set. Add it to the .env file in the project root, then restart.'));
  }

  const to = env.CONTACT_TO_EMAIL?.trim() || 'deepakde@iitbhilai.ac.in';
  const from = env.CONTACT_FROM_EMAIL?.trim() || 'Portfolio <onboarding@resend.dev>';
  const apiUrl = (env.RESEND_API_URL?.trim() || 'https://api.resend.com').replace(/\/+$/, '');
  const site = requestHost(req);
  const subject = `Portfolio message from ${name}`;
  const text = `${message}\n\n— ${name} <${email}>\nSent from the contact form on ${site}`;
  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#16140f">
  <p style="margin:0 0 4px;color:#6e695f;font-size:13px">New message from your portfolio contact form</p>
  <p style="margin:0 0 16px"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;</p>
  <div style="white-space:pre-wrap;padding:16px;border-radius:10px;background:#f6f4ef;border:1px solid #e3dfd5">${escapeHtml(message)}</div>
  <p style="margin:16px 0 0;color:#6e695f;font-size:12px">Reply to this email to answer ${escapeHtml(name)} directly · sent from ${escapeHtml(site)}</p>
</div>`;

  const idempotencyKey = randomUUID();
  const sendOnce = () =>
    fetch(`${apiUrl}/emails`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });

  try {
    let result;
    try {
      result = await sendOnce();
    } catch (first) {
      console.warn('[contact] Network error talking to Resend, retrying once:', first instanceof Error ? first.message : first);
      await new Promise((r) => setTimeout(r, 400));
      result = await sendOnce();
    }
    if (!result.ok) {
      const detail = (await result.text()).slice(0, 300);
      console.error('[contact] Resend rejected the request:', result.status, detail);
      let reason = detail;
      try { reason = JSON.parse(detail).message ?? detail; } catch { /* keep raw */ }
      return reply('send_failed', devDetail(`Resend responded ${result.status}: ${reason}`));
    }
    return reply('sent');
  } catch (err) {
    console.error('[contact] Could not reach Resend:', err instanceof Error ? err.message : err);
    return reply('send_failed', devDetail(`Could not reach Resend: ${err instanceof Error ? err.message : String(err)}`));
  }
}
