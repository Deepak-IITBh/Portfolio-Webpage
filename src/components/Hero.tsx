import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon } from './Icon';
import { profile, links } from '../data/site';
import '../styles/components/Hero.css';

const PROOF = [
  { value: '+383%', label: 'MRR@10 over BM25', href: '#dpr' },
  { value: '87.5%', label: 'false-negative filter accuracy', href: '#dpr' },
  { value: '15+', label: 'languages evaluated', href: '#dpr' },
  { value: '2', label: 'apps live on Render', href: '#invoice' },
];
const ROLES = ['retrieval systems', 'LLM agents', 'vision pipelines'];
const LETTERS = [...profile.name];

// Blueprint sketches, drawn from the real systems on this page.
const DPR_STAGES = ['corpora', 'bm25', 'llm·classify', 'rag·rank', 'dual-encoder', 'eval'];
const BARS = [0.0259, 0.0713, 0.1237];
const CROSSHAIRS = [[420, 120], [700, 330], [1150, 240], [742, 520], [1300, 780], [300, 480]];

const clockFormat = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });

function Blueprint() {
  return (
    <svg className="hero__blueprint" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
      <g transform="translate(820 96)">
        {DPR_STAGES.map((s, i) => (
          <g key={s} transform={`translate(${i * 96} ${i % 2 ? 18 : 0})`}>
            <rect width="82" height="30" rx="5" />
            <text x="41" y="19" textAnchor="middle">{s}</text>
            {i < DPR_STAGES.length - 1 && <path d={`M82 15 L96 ${i % 2 ? -3 : 33}`} />}
          </g>
        ))}
        <text className="bp-note" x="0" y="78">fig.1 — progressive hard-negative mining · MRR@10 .026 → .124</text>
      </g>

      <g transform="translate(866 279)">
        <path d="M0 150 H230" />
        {BARS.map((v, i) => {
          const h = (v / 0.1237) * 130;
          return (
            <g key={i}>
              <rect className={i === 2 ? 'bp-hot' : ''} x={18 + i * 72} y={150 - h} width="42" height={h} rx="2" />
              <text x={39 + i * 72} y={142 - h} textAnchor="middle">{v.toFixed(3).replace(/^0/, '')}</text>
              <text x={39 + i * 72} y="170" textAnchor="middle">{['bm25', 'llm', 'rag'][i]}</text>
            </g>
          );
        })}
        <text className="bp-note" x="0" y="196">fig.2 — +383% vs BM25, MS MARCO</text>
      </g>

      <g transform="translate(70 640)">
        <rect width="74" height="30" rx="5" /><text x="37" y="19" textAnchor="middle">guard</text>
        <path d="M74 15 H112" />
        <rect x="112" width="60" height="30" rx="5" /><text x="142" y="19" textAnchor="middle">kb</text>
        <path d="M172 15 H206" />
        <rect className="bp-hot" x="216" y="-6" width="30" height="30" rx="3" transform="rotate(45 231 15)" />
        <path d="M250 4 C 280 -30, 300 -40, 330 -40" /><text x="262" y="-28">hit</text>
        <path d="M250 26 C 280 60, 300 70, 330 70" /><text x="262" y="66">miss</text>
        <rect x="330" y="-56" width="92" height="30" rx="5" /><text x="376" y="-37" textAnchor="middle">generate</text>
        <rect x="330" y="55" width="64" height="30" rx="5" /><text x="362" y="74" textAnchor="middle">web</text>
        <path d="M362 55 V -26" />
        <text className="bp-note" x="0" y="130">fig.3 — langgraph router · route_log: guard ✓ → KB miss → Web Search</text>
      </g>

      <g transform="translate(70 170)">
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => (
            <circle key={`${r}-${c}`} className={(r * 5 + c * 3) % 4 === 0 ? '' : 'bp-fill'} cx={c * 30} cy={r * 30} r="9" />
          )),
        )}
        <rect className="bp-scan" x="-16" y="44" width="182" height="32" />
        <text className="bp-note" x="-12" y="172">fig.4 — omr · circle fill → present / absent</text>
      </g>

      <g transform="translate(640 760)">
        {Array.from({ length: 36 }).map((_, i) => {
          const h = 6 + Math.abs(Math.sin(i * 0.55) * 22 + Math.sin(i * 1.7) * 10);
          return <rect key={i} x={i * 7} y={-h / 2} width="3" height={h} rx="1.5" />;
        })}
        <text className="bp-note" x="0" y="54">fig.5 — meeting.mp4 → transcript → faiss → answers</text>
      </g>

      {CROSSHAIRS.map(([x, y]) => (
        <path key={`${x}-${y}`} className="bp-cross" d={`M${x - 6} ${y} H${x + 6} M${x} ${y - 6} V${y + 6}`} />
      ))}
    </svg>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const lampRef = useRef<HTMLSpanElement>(null);
  const [clock, setClock] = useState(() => `${profile.location} · IST`);

  // Local time in Bhilai.
  useEffect(() => {
    const tick = () => setClock(`${profile.location} · ${clockFormat.format(new Date())} IST`);
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // The lamp: light starts at the dot of "Deepak." and follows a fine pointer around the hero.
  useEffect(() => {
    const hero = heroRef.current;
    const lamp = lampRef.current;
    if (!hero || !lamp) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(pointer: fine)').matches;
    let home = { x: 0, y: 0 };
    let cur = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let raf = 0;

    const measure = () => {
      const h = hero.getBoundingClientRect();
      const l = lamp.getBoundingClientRect();
      home = { x: l.left + l.width / 2 - h.left, y: l.top + l.height / 2 - h.top };
    };
    const paint = () => {
      hero.style.setProperty('--lx', `${cur.x}px`);
      hero.style.setProperty('--ly', `${cur.y}px`);
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.09;
      cur.y += (target.y - cur.y) * 0.09;
      paint();
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const go = (x: number, y: number) => {
      target = { x, y };
      if (reduced) {
        cur = { ...target };
        paint();
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const h = hero.getBoundingClientRect();
      go(e.clientX - h.left, e.clientY - h.top);
    };
    const onLeave = () => go(home.x, home.y);
    const onResize = () => {
      measure();
      go(home.x, home.y);
    };

    measure();
    cur = { ...home };
    paint();
    // Re-measure once the name's entrance animation settles.
    const settle = window.setTimeout(() => {
      measure();
      cur = { ...home };
      target = { ...home };
      paint();
    }, reduced ? 0 : 1300);
    window.addEventListener('resize', onResize);
    if (fine && !reduced) {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
    }
    return () => {
      window.clearTimeout(settle);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__stage" aria-hidden="true">
        <svg className="hero__grid" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="bp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" />
            </pattern>
          </defs>
          <rect width="1440" height="900" fill="url(#bp-grid)" />
        </svg>
        <Blueprint />
        <div className="hero__light" />
      </div>

      <div className="container hero__inner">
        <div className="hero__top" data-reveal>
          <p className="hero__status">
            <span className="live-dot" aria-hidden="true" />
            <span><span className="muted">Now</span> {profile.now.label} · {profile.now.org}</span>
          </p>
          <p className="hero__clock mono">{clock}</p>
        </div>

        <h1 id="hero-title" className="hero__name">
          <span className="sr-only">{profile.name}, {profile.role}</span>
          <span className="hero__word" aria-hidden="true">
            {LETTERS.map((ch, i) => <span key={i} className="hero__letter" style={{ '--i': i } as CSSProperties}>{ch}</span>)}
            <span className="hero__lamp" ref={lampRef} />
          </span>
        </h1>

        <div className="hero__body">
          <p className="hero__statement" data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties}>
            <span className="sr-only">I build AI systems that actually work, and measure them to prove it.</span>
            <span aria-hidden="true">
              <span className="hero__line">I build</span>
              <span className="rotator">
                <span className="rotator__track">
                  {[...ROLES, ROLES[0]].map((r, i) => <span key={i} className="rotator__item">{r}</span>)}
                </span>
              </span>
              <span className="hero__line">that actually work — and measure them to prove it.</span>
            </span>
          </p>

          <div className="hero__side" data-reveal style={{ '--reveal-delay': '200ms' } as CSSProperties}>
            <p className="hero__role mono">{profile.role}</p>
            <p className="hero__summary">Retrieval · LLM agents · computer vision. Research to deployed product.</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#work">See the work <Icon name="arrow-right" /></a>
              <a className="btn" href="#ask"><Icon name="search" /> Ask my work</a>
              <a className="btn btn--icon" href={links.resume} target="_blank" rel="noopener noreferrer" aria-label="Resume (PDF, opens in a new tab)"><Icon name="file" /></a>
              <a className="btn btn--icon" href={links.github} target="_blank" rel="noopener noreferrer me" aria-label="GitHub (opens in a new tab)"><Icon name="github" /></a>
              <a className="btn btn--icon" href={links.linkedin} target="_blank" rel="noopener noreferrer me" aria-label="LinkedIn (opens in a new tab)"><Icon name="linkedin" /></a>
            </div>
          </div>
        </div>

        <ul className="proof" data-reveal style={{ '--reveal-delay': '300ms' } as CSSProperties} aria-label="Highlights">
          {PROOF.map((p) => (
            <li key={p.label}>
              <a className="proof__item" href={p.href}>
                <span className="proof__value">{p.value}</span>
                <span className="proof__label">{p.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
