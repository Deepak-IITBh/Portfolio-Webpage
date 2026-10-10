import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Icon } from './Icon';
import { index, corpus, layout, docById, nodeById, MAP_W, MAP_H, navigateTo } from '../lib/search';
import '../styles/components/Console.css';

const DEFAULT_QUERY = 'rag agents';
const SUGGESTIONS = ['multilingual retrieval', 'agents with guardrails', 'computer vision', 'deployed apps', 'hire'];
const Q = { x: 300, y: 170 };
const SQUARE_KINDS = new Set(['role', 'internship', 'education']);
const fmt = (ms: number) => (ms < 0.1 ? '<0.1 ms' : `${ms.toFixed(1)} ms`);

/** The "ask-my-work" instrument: a BM25 search whose matches light up on a map of the whole site. */
export function Console() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [animate, setAnimate] = useState(false);
  const [tipId, setTipId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const { res, ms } = useMemo(() => {
    const t0 = performance.now();
    const r = index.search(query, 3);
    return { res: r, ms: performance.now() - t0 };
  }, [query]);
  const hitIds = new Set(res.hits.map((h) => h.doc.id));
  const active = res.tokens.length > 0;

  // "/" focuses this console while it is on screen (the palette handles it elsewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]');
      if (e.key !== '/' || typing || !rootRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Keep the node label inside the panel.
  useLayoutEffect(() => {
    const tip = tipRef.current;
    const map = mapRef.current;
    if (!tip || !map || !tipId) return;
    const n = nodeById.get(tipId);
    const svg = map.querySelector('svg');
    if (!n || !svg) return;
    const scale = svg.getBoundingClientRect().width / MAP_W;
    const half = tip.offsetWidth / 2;
    tip.style.left = `${Math.min(Math.max(n.x * scale, half + 4), map.clientWidth - half - 4)}px`;
    tip.style.top = `${n.y * scale - n.r * scale}px`;
  }, [tipId]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAnimate(true);
  };
  const pick = (q: string) => {
    setQuery(q);
    setAnimate(true);
  };
  const tipDoc = tipId ? docById.get(tipId) : undefined;

  return (
    <section className="inst" aria-labelledby="console-title" ref={rootRef}>
      <header className="inst__bar">
        <h2 id="console-title" className="inst__title mono">
          <Icon name="search" size={13} /> ask-my-work
        </h2>
        <p className="inst__meta mono">bm25 · {index.size} docs · in your browser</p>
      </header>

      <form className="inst__form" role="search" onSubmit={onSubmit}>
        <label htmlFor="console-input" className="sr-only">Search everything on this page</label>
        <span className="inst__prompt mono" aria-hidden="true">›</span>
        <input
          id="console-input"
          ref={inputRef}
          className="inst__input mono"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setAnimate(false);
          }}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="Ask about my work…"
        />
        <kbd className="kbd inst__kbd" aria-hidden="true">/</kbd>
      </form>

      <div className="inst__chips" role="group" aria-label="Example queries">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip mono" aria-pressed={query.trim().toLowerCase() === s} onClick={() => pick(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="map" ref={mapRef} aria-hidden="true">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="map__svg" role="presentation">
          <g className="map__edges">
            {layout.edges.map(([a, b]) => {
              const p = nodeById.get(a);
              const q = nodeById.get(b);
              if (!p || !q) return null;
              return <line key={`${a}|${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={hitIds.has(a) || hitIds.has(b) ? 'is-lit' : undefined} />;
            })}
          </g>
          <g className="map__clusters">
            {layout.halos.map((c) => (
              <g key={c.id}>
                <ellipse cx={c.x} cy={c.y} rx={c.r} ry={c.r * 0.84} />
                <text x={c.x} y={c.y - c.r * 0.84 - 6} textAnchor="middle">{c.label}</text>
              </g>
            ))}
          </g>
          <g className="map__rays" key={`rays-${query}-${animate}`}>
            {res.hits.map((h, i) => {
              const n = nodeById.get(h.doc.id);
              if (!n) return null;
              return (
                <line
                  key={h.doc.id}
                  x1={Q.x}
                  y1={Q.y}
                  x2={n.x}
                  y2={n.y}
                  className={animate ? 'is-new' : undefined}
                  style={animate ? ({ '--i': `${i * 70}ms` } as CSSProperties) : undefined}
                />
              );
            })}
          </g>
          <g className="map__query">
            <rect x={Q.x - 5} y={Q.y - 5} width="10" height="10" transform={`rotate(45 ${Q.x} ${Q.y})`} />
            <text x={Q.x + 12} y={Q.y + 4}>query</text>
          </g>
          <g className="map__nodes">
            {layout.nodes.map((n, i) => {
              const hit = hitIds.has(n.id);
              const cls = ['node', `node--${n.kind.replace(' ', '-')}`, hit ? 'is-hit' : active ? 'is-dim' : ''].filter(Boolean).join(' ');
              return (
                <g
                  key={n.id}
                  className={cls}
                  style={{ '--d': `${i * 22}ms` } as CSSProperties}
                  onMouseEnter={() => setTipId(n.id)}
                  onMouseLeave={() => setTipId((cur) => (cur === n.id ? null : cur))}
                  onClick={() => {
                    const d = docById.get(n.id);
                    if (d) navigateTo(d.href);
                  }}
                >
                  <circle className="node__halo" cx={n.x} cy={n.y} r={n.r + 7} />
                  {SQUARE_KINDS.has(n.kind) ? (
                    <rect className="node__dot" x={n.x - n.r} y={n.y - n.r} width={n.r * 2} height={n.r * 2} rx="1.5" />
                  ) : (
                    <circle className="node__dot" cx={n.x} cy={n.y} r={n.r} />
                  )}
                  <circle className="node__hit" cx={n.x} cy={n.y} r={n.r + 9} />
                </g>
              );
            })}
          </g>
          <g className="map__ranks">
            {res.hits.map((h, i) => {
              const n = nodeById.get(h.doc.id);
              return n ? <text key={h.doc.id} x={n.x + n.r + 4} y={n.y - n.r - 2}>{i + 1}</text> : null;
            })}
          </g>
        </svg>
        {tipDoc && (
          <div className="map__tip mono" ref={tipRef}>
            {tipDoc.title}
            <span>{tipDoc.kind}</span>
          </div>
        )}
      </div>

      <p className="inst__trace mono">
        <span>
          tokenize [{res.tokens.join(', ')}] → expand {res.expanded.length ? res.expanded.slice(0, 3).map((t) => `+${t}`).join(' ') : '∅'} → bm25 {res.candidates}/{corpus.length}
        </span>
        <span className="inst__time">{fmt(ms)}</span>
      </p>

      <ol className="hits" aria-label="Results">
        {res.hits.length ? (
          res.hits.map((h, i) => (
            <li key={`${h.doc.id}-${animate}`} className={animate ? 'is-new' : undefined} style={{ '--i': i } as CSSProperties}>
              <a
                className="hit"
                href={h.doc.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(h.doc.href);
                }}
              >
                <span className="hit__rank mono">{i + 1}</span>
                <span className="hit__title">{h.doc.title}</span>
                <span className="hit__kind mono">{h.doc.kind}</span>
                <span className="hit__score mono">{h.score.toFixed(2)}</span>
              </a>
            </li>
          ))
        ) : (
          <li className="empty">{active ? 'Nothing matched. Try “retrieval”, “vision” or “agents”.' : 'Type to search everything on this page.'}</li>
        )}
      </ol>
      <p className="sr-only" aria-live="polite">{active ? `${res.hits.length} results for ${query}` : ''}</p>
    </section>
  );
}
