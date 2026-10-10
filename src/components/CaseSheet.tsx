import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Pipeline } from './Pipeline';
import { DiagramPicture } from './DiagramPicture';
import type { Project } from '../data/projects';
import '../styles/components/CaseSheet.css';

interface CaseSheetProps {
  project: Project;
  index: number;
  open: boolean;
  onClose: () => void;
}

/** The full engineering write-up for a project, as a modal sheet (native <dialog>: focus trap + Esc come for free). */
export function CaseSheet({ project: p, index, open, onClose }: CaseSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      className="sheet"
      id={`sheet-${p.id}`}
      ref={ref}
      aria-labelledby={`sheet-${p.id}-title`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="sheet__inner">
        <header className="sheet__head">
          <p className="sheet__meta mono"><span className="sheet__num">{String(index + 1).padStart(2, '0')}</span> {p.kind} · {p.domain.join(' · ')}</p>
          <button type="button" className="sheet__close" onClick={() => ref.current?.close()} aria-label="Close case study"><Icon name="close" /></button>
        </header>

        <h2 className="sheet__title" id={`sheet-${p.id}-title`}>{p.title}</h2>
        <p className="sheet__tagline">{p.tagline}</p>
        <ul className="sheet__links">
          {p.links.map((l) => (
            <li key={l.href}>
              <a className="arrow-link" href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label === 'Source' ? 'GitHub' : l.label} <Icon name="arrow" size={14} /><span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="sheet__cols">
          <section>
            <h3 className="sheet__h mono">The problem</h3>
            <p>{p.problem}</p>
          </section>
          <section>
            <h3 className="sheet__h mono">The approach</h3>
            <p>{p.approach}</p>
          </section>
        </div>

        {p.metrics.length > 0 && (
          <dl className="sheet__metrics">
            {p.metrics.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd className="sheet__metric-value">{m.value}</dd>
                <dd className="sheet__metric-source mono">source: {m.source}</dd>
              </div>
            ))}
          </dl>
        )}

        <section className="sheet__block">
          <h3 className="sr-only">Architecture</h3>
          {p.diagram && (
            <figure className="sheet__diagram">
              <a href={p.diagram.full} target="_blank" rel="noopener noreferrer">
                <DiagramPicture image={p.diagram} sizes="(min-width: 960px) 860px, 100vw" />
                <span className="sr-only">(opens full size in a new tab)</span>
              </a>
              <figcaption className="mono">System architecture · click to open full size ↗</figcaption>
            </figure>
          )}
          <Pipeline id={`sheet-${p.id}`} nodes={p.pipeline} />
        </section>

        {p.results && (
          <section className="sheet__block">
            <h3 className="sheet__h mono">What the numbers said</h3>
            <p className="sheet__p">{p.results}</p>
          </section>
        )}

        <section className="sheet__block">
          <h3 className="sheet__h mono">Decisions I made, and why</h3>
          <ol className="sheet__decisions">
            {p.decisions.map((d) => (
              <li key={d.choice}>
                <p className="sheet__choice">{d.choice}</p>
                <p className="sheet__why">{d.why}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="sheet__stack mono">{p.stack.join(' · ')}</footer>
      </div>
    </dialog>
  );
}
