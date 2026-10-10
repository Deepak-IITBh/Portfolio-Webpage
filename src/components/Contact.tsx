import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Icon, type IconName } from './Icon';
import { profile, links } from '../data/site';
import '../styles/components/Contact.css';

const CHANNELS: { label: string; handle: string; href: string; icon: IconName; external: boolean }[] = [
  { label: 'GitHub', handle: 'Deepak-IITBh', href: links.github, icon: 'github', external: true },
  { label: 'LinkedIn', handle: 'deepak-k', href: links.linkedin, icon: 'linkedin', external: true },
  { label: 'Email', handle: profile.email, href: links.email, icon: 'mail', external: false },
  { label: 'Resume', handle: 'PDF · 1 page', href: links.resume, icon: 'file', external: true },
  { label: 'Provisional Certificate', handle: 'B.Tech · PDF', href: links.certificate, icon: 'file', external: true },
];

type FieldName = 'name' | 'email' | 'message';
type ApiReply = { ok?: boolean; error?: string; message?: string; detail?: string; fields?: string[] };

const clockFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Contact() {
  const [values, setValues] = useState<Record<FieldName, string>>({ name: '', email: '', message: '' });
  const [invalid, setInvalid] = useState<Set<FieldName>>(new Set());
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; kind: '' | 'error' | 'ok' }>({ text: '', kind: '' });
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState('Bhilai, India · IST');
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), message: useRef<HTMLTextAreaElement>(null) };
  const honeypot = useRef<HTMLInputElement>(null);
  const doneTitle = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tick = () => setClock(`${clockFormat.format(new Date())} in Bhilai`);
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const set = (field: FieldName, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setInvalid((s) => {
      if (!s.has(field)) return s;
      const next = new Set(s);
      next.delete(field);
      return next;
    });
    setStatus({ text: '', kind: '' });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;

    const bad = (['name', 'email', 'message'] as FieldName[]).filter((f) => !values[f].trim() || (f === 'email' && !EMAIL_RE.test(values.email.trim())));
    setInvalid(new Set(bad));
    if (bad.length) {
      refs[bad[0]].current?.focus();
      setStatus({ text: bad[0] === 'email' && values.email.trim() ? 'Please enter a valid email address.' : 'Please fill in every field.', kind: 'error' });
      return;
    }

    const payload = { name: values.name.trim(), email: values.email.trim(), message: values.message.trim(), company: honeypot.current?.value ?? '' };
    setSending(true);
    setStatus({ text: '', kind: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ApiReply = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSentTo(payload.name);
        window.setTimeout(() => doneTitle.current?.focus(), 0);
      } else if (data.error === 'invalid' && data.fields?.length) {
        const fields = data.fields.filter((f): f is FieldName => f === 'name' || f === 'email' || f === 'message');
        setInvalid(new Set(fields));
        if (fields[0]) refs[fields[0]].current?.focus();
        setStatus({ text: data.message ?? 'Please check the highlighted fields.', kind: 'error' });
      } else if (data.error === 'rate_limited') {
        setStatus({ text: data.message ?? 'Too many messages. Please try again in a few minutes.', kind: 'error' });
      } else {
        // `detail` is only sent by the dev server (setup hints); production shows the friendly message.
        setStatus({
          text: data.detail
            ? `${data.message} [dev] ${data.detail}`
            : `${data.message ?? 'Your message could not be sent right now.'} You can also email ${profile.email} directly.`,
          kind: 'error',
        });
      }
    } catch {
      setStatus({ text: `Network error. Check your connection and try again, or email ${profile.email} directly.`, kind: 'error' });
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setValues({ name: '', email: '', message: '' });
    setInvalid(new Set());
    setSentTo(null);
    setStatus({ text: '', kind: '' });
    window.setTimeout(() => refs.name.current?.focus(), 0);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setStatus({ text: `Copy failed. My email is ${profile.email}`, kind: 'error' });
    }
  };

  const aria = (f: FieldName) => (invalid.has(f) ? true : undefined);

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container contact__wrap">
        <header className="contact__head" data-reveal>
          <p className="mono contact__index" aria-hidden="true"><span>05</span><span className="contact__rule" /><span>Contact</span></p>
          <h2 className="contact__title" id="contact-title">Let’s build something that <span className="accent-word">works</span>.</h2>
          <p className="contact__sub">Open to AI / ML roles and collaborations.</p>
        </header>

        <div className="contact__grid">
          {/* Posted to /api/contact, which emails it server-side via Resend (a plain form post works without JS too). */}
          <form className="panel form" action="/api/contact" method="post" noValidate onSubmit={onSubmit} data-reveal>
            <div className="panel__top">
              <h3 className="panel__title">Send a message</h3>
              <span className="panel__meta mono">straight to my inbox</span>
            </div>

            <div className="form__fields" hidden={sentTo !== null}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="cf-name" className="field__label mono">Your name</label>
                  <input id="cf-name" name="name" type="text" autoComplete="name" required maxLength={80} placeholder="Ada Lovelace" className="field__input" ref={refs.name} value={values.name} onChange={(e) => set('name', e.target.value)} aria-invalid={aria('name')} readOnly={sending} />
                </div>
                <div className="field">
                  <label htmlFor="cf-email" className="field__label mono">Your email</label>
                  <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={120} placeholder="you@company.com" className="field__input" ref={refs.email} value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={aria('email')} readOnly={sending} />
                </div>
              </div>
              <div className="field field--grow">
                <label htmlFor="cf-message" className="field__label mono">
                  Message <span className="field__count" aria-hidden="true">{values.message.length} / 2000</span>
                </label>
                <textarea id="cf-message" name="message" required maxLength={2000} rows={3} placeholder="What are you building?" className="field__input field__area" ref={refs.message} value={values.message} onChange={(e) => set('message', e.target.value)} aria-invalid={aria('message')} readOnly={sending} />
              </div>

              {/* Honeypot: hidden from people, irresistible to bots. */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="cf-company">Company</label>
                <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" ref={honeypot} />
              </div>

              <button type="submit" className="btn btn--primary form__send" disabled={sending} aria-busy={sending}>
                <span className="form__spinner" aria-hidden="true" />
                <Icon name="send" /> <span>{sending ? 'Sending…' : 'Send message'}</span>
              </button>
            </div>

            <div className="form__done" hidden={sentTo === null}>
              <span className="done__icon" aria-hidden="true"><Icon name="check" size={22} /></span>
              <p className="done__title" tabIndex={-1} ref={doneTitle}>Message sent successfully ✓</p>
              <p className="done__sub">Thanks, {sentTo}. It’s in my inbox.</p>
              <button type="button" className="btn done__again" onClick={reset}>Send another message</button>
            </div>

            <p className="form__status mono" role="status" aria-live="polite" data-kind={status.kind}>{status.text}</p>
          </form>

          <aside className="panel connect" aria-labelledby="connect-title" data-reveal style={{ '--reveal-delay': '100ms' } as CSSProperties}>
            <div className="panel__top">
              <h3 className="panel__title" id="connect-title">Connect</h3>
              <span className="panel__meta mono">{clock}</span>
            </div>

            <ul className="links">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a href={c.href} className="link-row" target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener noreferrer' : undefined}>
                    <span className="link-row__icon"><Icon name={c.icon} size={16} /></span>
                    <span className="link-row__text">
                      <span className="link-row__label">{c.label}</span>
                      <span className="link-row__handle mono">{c.handle}</span>
                    </span>
                    <Icon name="arrow" size={14} className="link-row__arrow" />
                    {c.external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>

            <div className="connect__foot">
              <button className={`btn contact__copy${copied ? ' is-copied' : ''}`} type="button" onClick={copy}>
                <Icon name="copy" className="icon-copy" /><Icon name="check" className="icon-check" />
                <span>{copied ? 'Copied' : 'Copy email'}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
