import { useEffect, useRef, useState, type CSSProperties } from 'react';
import '../styles/components/Stage.css';

/**
 * Live, replayable visuals for each case study. They play when their project scrolls into view
 * (the `.is-playing` class is set on the surrounding `.stage-host` by Work.tsx). Everything shown is drawn
 * from the project itself; the invoice, recording and sheet are labelled as illustrations.
 */
export type StageId = 'math-agent' | 'meeting-agent' | 'invoice' | 'attendance';

const vars = (o: Record<string, string | number>) => o as CSSProperties;

// Meeting waveform.
const WAVE = Array.from({ length: 48 }, (_, i) => 8 + Math.abs(Math.sin(i * 0.55) * 30 + Math.sin(i * 1.7) * 16 + Math.cos(i * 0.21) * 10));

// Attendance sheet (illustrative): rows × columns, filled = present.
const SHEET = Array.from({ length: 6 }, (_, r) => Array.from({ length: 9 }, (_, c) => (r * 7 + c * 3 + ((r * c) % 5)) % 6 !== 0));

type Seq = [hit: number | null, miss: number | null];
type Route = 'hit' | 'miss';

const LOG: { text: string; seq: Seq }[] = [
  { text: 'guard  ·  Valid math query', seq: [2, 2] },
  { text: 'kb     ·  KB hit', seq: [4, null] },
  { text: 'kb     ·  KB miss → Web Search', seq: [null, 4] },
  { text: 'web    ·  Web search success', seq: [null, 8] },
  { text: 'gen    ·  solution + steps + source', seq: [8, 10] },
  { text: 'human  ·  POST /feedback  (rating)', seq: [10, 12] },
];

function Agent() {
  const [route, setRoute] = useState<Route>('miss');
  const rootRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Switching route replays the animation (restart `.is-playing` on the surrounding project).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const host = rootRef.current?.closest<HTMLElement>('.stage-host');
    if (!host) return;
    host.classList.remove('is-playing');
    void host.offsetWidth;
    host.classList.add('is-playing');
  }, [route]);

  const pos = (s: Seq) => (route === 'hit' ? s[0] : s[1]);
  /** Class + animation-delay index for an element that is on the active route. */
  const on = (s: Seq) => ({ className: pos(s) !== null ? 'on' : 'off', style: pos(s) !== null ? vars({ '--s': pos(s)! }) : undefined });
  const edge = (d: string, s: Seq) => {
    const { className, style } = on(s);
    return <path className={`edge ${className}`} pathLength={1} d={d} style={style} />;
  };
  const node = (extra: string, s: Seq, children: React.ReactNode) => {
    const { className, style } = on(s);
    return <g className={`anode ${extra} ${className}`.replace(/\s+/g, ' ').trim()} style={style}>{children}</g>;
  };

  return (
    <div className="agent" ref={rootRef}>
      <div className="stage__controls" role="group" aria-label="Replay a route">
        <span className="mono stage__hint">replay a request:</span>
        <button type="button" className="seg-btn mono" aria-pressed={route === 'hit'} onClick={() => setRoute('hit')}>KB hit</button>
        <button type="button" className="seg-btn mono" aria-pressed={route === 'miss'} onClick={() => setRoute('miss')}>KB miss</button>
      </div>
      <svg viewBox="0 0 480 250" aria-hidden="true">
        <path className="loop" d="M452 59 C 452 14, 200 14, 195 128" />
        <text className="t-note" x="262" y="30">human feedback → refine</text>

        {edge('M70 144 H84', [1, 1])}
        {edge('M146 144 H170', [3, 3])}
        {edge('M220 144 H240', [5, 5])}
        {edge('M278 130 C 300 92, 310 75, 330 75', [7, null])}
        {edge('M278 158 C 300 200, 310 221, 330 221', [null, 7])}
        {edge('M366 206 V 90', [null, 9])}
        {edge('M426 75 H436', [9, 11])}
        <text className="t-note" x="270" y="104">hit</text>
        <text className="t-note" x="262" y="196">miss</text>

        {node('', [0, 0], <><rect x="14" y="130" width="56" height="28" rx="14" /><text x="42" y="148">query</text></>)}
        {node('', [2, 2], <><rect x="84" y="129" width="62" height="30" rx="6" /><text x="115" y="148">guard</text></>)}
        {node('', [4, 4], <><rect x="170" y="129" width="50" height="30" rx="6" /><text x="195" y="148">KB</text></>)}
        {node('anode--router', [6, 6], <><rect x="241" y="127" width="34" height="34" rx="5" transform="rotate(45 258 144)" /><text x="258" y="147" className="t-small">route</text></>)}
        {node('', [8, 10], <><rect x="330" y="60" width="96" height="30" rx="6" /><text x="378" y="79">generate</text></>)}
        {node('', [null, 8], <><rect x="330" y="206" width="72" height="30" rx="6" /><text x="366" y="225">web</text></>)}
        {node('', [10, 12], <><circle cx="452" cy="75" r="16" /><text x="452" y="78" className="t-small">rate</text></>)}
      </svg>
      <ol className="log mono" aria-label="Route log">
        {LOG.map((l) => {
          const { className, style } = on(l.seq);
          return <li key={l.text} className={className} style={style}>{l.text}</li>;
        })}
      </ol>
    </div>
  );
}

function Meeting() {
  return (
    <div className="meeting">
      <svg viewBox="0 0 480 300" aria-hidden="true">
        <g transform="translate(22 128)" className="wave">
          {WAVE.map((h, i) => (
            <rect key={i} className={`bar${i > 18 && i < 30 ? ' bar--hot' : ''}`} x={i * 4.3} y={-h / 2} width="2.6" height={h} rx="1.3" style={vars({ '--i': i })} />
          ))}
        </g>
        <text className="t-note" x="22" y="212">meeting.mp4 → audio → transcript</text>
        <path className="edge edge--static" d="M236 128 H262" />

        <g className="card">
          <rect className="card__bg" x="268" y="30" width="192" height="236" rx="10" />
          <text className="t-label" x="284" y="56">summary</text>
          <rect className="fill-line" style={vars({ '--d': 0 })} x="284" y="66" width="158" height="5" rx="2.5" />
          <rect className="fill-line" style={vars({ '--d': 1 })} x="284" y="77" width="122" height="5" rx="2.5" />
          <rect className="fill-line" style={vars({ '--d': 2 })} x="284" y="88" width="140" height="5" rx="2.5" />
          <text className="t-label" x="284" y="122">action items</text>
          <rect className="check" style={vars({ '--d': 3 })} x="284" y="132" width="10" height="10" rx="2" />
          <rect className="fill-line" style={vars({ '--d': 3 })} x="302" y="134.5" width="120" height="5" rx="2.5" />
          <rect className="check" style={vars({ '--d': 4 })} x="284" y="150" width="10" height="10" rx="2" />
          <rect className="fill-line" style={vars({ '--d': 4 })} x="302" y="152.5" width="96" height="5" rx="2.5" />
          <text className="t-label" x="284" y="190">ask the meeting</text>
          <g className="askbox" style={vars({ '--d': 5 })}>
            <rect x="284" y="200" width="160" height="26" rx="13" />
            <text x="296" y="217">What did we decide?</text>
          </g>
          <text className="t-note topk" x="284" y="250" style={vars({ '--d': 6 })}>top-k chunks → grounded answer</text>
        </g>
      </svg>
    </div>
  );
}

function Invoice() {
  return (
    <div className="invoice">
      <svg viewBox="0 0 480 300" aria-hidden="true">
        <g className="doc">
          <rect className="card__bg" x="30" y="26" width="172" height="248" rx="8" />
          <rect className="ink" x="46" y="44" width="64" height="9" rx="2" />
          <rect className="line" x="46" y="68" width="92" height="5" rx="2.5" />
          <rect className="line" x="46" y="78" width="70" height="5" rx="2.5" />
          {[0, 1, 2, 3].map((r) => <rect key={r} className="line" x="46" y={116 + r * 18} width="140" height="5" rx="2.5" />)}
          <rect className="ink" x="126" y="216" width="60" height="8" rx="2" />
        </g>
        <rect className="box" pathLength={1} style={vars({ '--d': 0 })} x="40" y="38" width="86" height="21" rx="3" />
        <rect className="box" pathLength={1} style={vars({ '--d': 1 })} x="40" y="62" width="104" height="27" rx="3" />
        <rect className="box" pathLength={1} style={vars({ '--d': 2 })} x="120" y="209" width="72" height="22" rx="3" />
        <path className="wire" pathLength={1} style={vars({ '--d': 3 })} d="M126 48 C 196 48, 206 94, 258 94" />
        <path className="wire" pathLength={1} style={vars({ '--d': 4 })} d="M144 76 C 198 76, 210 116, 258 116" />
        <path className="wire" pathLength={1} style={vars({ '--d': 5 })} d="M192 220 C 228 220, 228 138, 258 138" />
        <g className="code">
          <rect x="248" y="60" width="210" height="146" rx="8" />
          <text x="264" y="84">{'{'}</text>
          <text className="j" style={vars({ '--d': 3 })} x="276" y="98">"invoice_no": …,</text>
          <text className="j" style={vars({ '--d': 4 })} x="276" y="120">"date": …,</text>
          <text className="j" style={vars({ '--d': 5 })} x="276" y="142">"total": …</text>
          <text x="264" y="164">{'}'}</text>
          <text className="ok" style={vars({ '--d': 7 })} x="264" y="190">✓ validated · pydantic</text>
        </g>
        <text className="t-note" x="248" y="234">LLaMA 3.2 Vision (Groq) → JSON · CSV</text>
        <text className="t-note" x="248" y="252">batch: .zip of invoices</text>
      </svg>
    </div>
  );
}

function Omr() {
  const [row, setRow] = useState(2);
  const rootRef = useRef<HTMLDivElement>(null);

  // Step a scan line through the illustrative sheet while the project is on screen.
  useEffect(() => {
    const host = rootRef.current?.closest<HTMLElement>('.stage-host');
    if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: number | undefined;
    const sync = () => {
      window.clearInterval(timer);
      if (host.classList.contains('is-playing')) {
        setRow(0);
        timer = window.setInterval(() => setRow((r) => (r + 1) % SHEET.length), 900);
      }
    };
    const observer = new MutationObserver(sync);
    observer.observe(host, { attributes: true, attributeFilter: ['class'] });
    sync();
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const present = SHEET[row].filter(Boolean).length;
  return (
    <div className="omr" ref={rootRef}>
      <svg viewBox="0 0 480 300" aria-hidden="true">
        <rect className="card__bg" x="22" y="26" width="300" height="214" rx="8" />
        <rect className="scan" x="22" y="44" width="300" height="30" style={{ transform: `translateY(${row * 32}px)` }} />
        {SHEET.map((cells, r) => (
          <g key={r} className={r === row ? 'row-active' : undefined}>
            <text className="t-label" x="38" y={64 + r * 32}>{String(r + 1).padStart(2, '0')}</text>
            {cells.map((filled, c) => <circle key={c} className={filled ? 'omrmark omrmark--on' : 'omrmark'} cx={84 + c * 26} cy={59 + r * 32} r="8" />)}
          </g>
        ))}
        <path className="edge edge--static" d="M326 120 H352" />
        <g className="code">
          <rect x="356" y="72" width="104" height="100" rx="8" />
          <text x="370" y="98">row {String(row + 1).padStart(2, '0')}</text>
          <text className="ok" x="370" y="122">● {present} present</text>
          <text x="370" y="146">○ {SHEET[row].length - present} absent</text>
        </g>
        <text className="t-note" x="22" y="266">OpenCV OMR + local Tesseract · fully offline</text>
      </svg>
    </div>
  );
}

export function Stage({ id, label }: { id: StageId; label: string }) {
  const replay = (e: React.MouseEvent<HTMLButtonElement>) => {
    const host = e.currentTarget.closest<HTMLElement>('.stage-host');
    if (!host) return;
    host.classList.remove('is-playing');
    void host.offsetWidth;
    host.classList.add('is-playing');
  };

  return (
    <figure className="stage">
      <div className="stage__frame">
        {id === 'math-agent' && <Agent />}
        {id === 'meeting-agent' && <Meeting />}
        {id === 'invoice' && <Invoice />}
        {id === 'attendance' && <Omr />}
      </div>
      <figcaption className="stage__caption mono">
        <span>{label}</span>
        {id !== 'math-agent' && <button type="button" className="replay" onClick={replay}>↻ replay</button>}
      </figcaption>
    </figure>
  );
}
