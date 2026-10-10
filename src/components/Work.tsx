import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Chapter } from './Chapter';
import { Icon, type IconName } from './Icon';
import { Benchmark } from './Benchmark';
import { Stage, type StageId } from './Stage';
import { CaseSheet } from './CaseSheet';
import { DiagramPicture } from './DiagramPicture';
import { projects, moreWork } from '../data/projects';
import { links } from '../data/site';
import '../styles/components/Work.css';

const STAGE_LABEL: Record<string, string> = {
  dpr: 'live benchmark · from the repository README',
  'math-agent': 'route replay · log lines from the agent’s code',
  'meeting-agent': 'pipeline replay · illustrative recording',
  invoice: 'extraction replay · illustrative invoice',
  attendance: 'scan replay · illustrative sheet',
};
const linkLabel = (l: string) => (l === 'Source' ? 'GitHub' : l);
const linkIcon = (l: string): IconName => (l === 'Source' ? 'github' : l === 'Demo video' ? 'play' : 'arrow');

type View = 'bench' | 'arch';

/** DPR's pinned visual: the interactive benchmark, or the system-architecture diagram from the repository. */
function DprViews({ diagram }: { diagram: NonNullable<(typeof projects)[number]['diagram']> }) {
  const [view, setView] = useState<View>('bench');
  const tabs = useRef<Record<View, HTMLButtonElement | null>>({ bench: null, arch: null });
  const order: View[] = ['bench', 'arch'];

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = order[(i + (e.key === 'ArrowRight' ? 1 : -1) + order.length) % order.length];
    setView(next);
    tabs.current[next]?.focus();
  };

  return (
    <figure className="stage-wrap views">
      <div className="views__tabs" role="tablist" aria-label="DPR visuals">
        {order.map((v, i) => (
          <button
            key={v}
            type="button"
            role="tab"
            className="views__tab mono"
            id={`dpr-view-tab-${v}`}
            aria-controls={`dpr-view-${v}`}
            aria-selected={view === v}
            tabIndex={view === v ? 0 : -1}
            ref={(el) => { tabs.current[v] = el; }}
            onClick={() => setView(v)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {v === 'bench' ? 'Benchmark' : 'Architecture'}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="dpr-view-bench" aria-labelledby="dpr-view-tab-bench" hidden={view !== 'bench'}>
        <Benchmark />
        <p className="mono step__cap">{STAGE_LABEL.dpr}</p>
      </div>
      <div role="tabpanel" id="dpr-view-arch" aria-labelledby="dpr-view-tab-arch" hidden={view !== 'arch'}>
        <a className="diagram" href={diagram.full} target="_blank" rel="noopener noreferrer">
          <DiagramPicture image={diagram} sizes="(min-width: 1000px) 640px, 100vw" className="diagram__img" />
          <span className="sr-only">(opens full size in a new tab)</span>
        </a>
        <p className="mono step__cap">system architecture · from the repository · click to open full size ↗</p>
      </div>
    </figure>
  );
}

export function Work() {
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Play each project's stage while it is on screen.
  useEffect(() => {
    const steps = rootRef.current?.querySelectorAll<HTMLElement>('.step') ?? [];
    const play = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting && !el.classList.contains('is-playing')) el.classList.add('is-playing');
          if (!e.isIntersecting) el.classList.remove('is-playing');
        }
      },
      { rootMargin: '-25% 0px -25% 0px' },
    );
    steps.forEach((s) => play.observe(s));
    return () => play.disconnect();
  }, []);

  return (
    <section className="section work" id="work" aria-labelledby="work-title" ref={rootRef}>
      <div className="container">
        <Chapter id="work" index="01" label="Work" title="Things I’ve" accent="built" intro="Five systems. Each one replays as you scroll." />
      </div>

      <div className="container">
        {projects.map((p, i) => {
          const isLive = p.links.some((l) => l.label === 'Live app');
          return (
            <article key={p.id} className={`step stage-host${i % 2 === 1 ? ' step--flip' : ''}`} id={p.id} aria-labelledby={`${p.id}-title`}>
              <div className="step__visual">
                <div className="step__sticky">
                  {p.id === 'dpr' && p.diagram ? <DprViews diagram={p.diagram} /> : p.id === 'dpr' ? <Benchmark /> : <Stage id={p.id as StageId} label={STAGE_LABEL[p.id]} />}
                </div>
              </div>

              <div className="step__text">
                <p className="step__meta mono">
                  <span className="step__num">{String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                  <span>{p.kind}</span>
                  {isLive && <span className="step__live"><span className="live-dot" aria-hidden="true" />live</span>}
                </p>
                <h3 className="step__title" id={`${p.id}-title`}>{p.title}</h3>
                <p className="step__tagline">{p.tagline}</p>

                {p.metrics.length > 0 && (
                  <dl className="step__metrics">
                    {p.metrics.slice(0, 3).map((m) => (
                      <div key={m.label}>
                        <dt className="sr-only">{m.label}</dt>
                        <dd className="step__metric-value">{m.value}</dd>
                        <dd className="step__metric-label" aria-hidden="true">{m.label}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <dl className="spec">
                  {p.spec.map(([k, v]) => (
                    <div className="spec__row" key={k}>
                      <dt className="mono">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="step__actions">
                  <button type="button" className="btn btn--primary" aria-haspopup="dialog" onClick={() => setOpenSheet(p.id)}>
                    Open the case study <Icon name="arrow-right" />
                  </button>
                  {p.links.map((l) => (
                    <a className="btn" key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      <Icon name={linkIcon(l.label)} /> {linkLabel(l.label)}<span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          );
        })}

        <section className="more" id="more-work" aria-labelledby="more-title" data-reveal>
          <div className="more__head">
            <h3 id="more-title" className="more__title">More from the <span className="accent-word">workbench</span></h3>
            <a className="arrow-link" href={links.github} target="_blank" rel="noopener noreferrer">All repositories <Icon name="arrow" size={14} /></a>
          </div>
          <ul className="more__list">
            {moreWork.map((m) => (
              <li className="more__item" key={m.title}>
                <a href={m.href} target="_blank" rel="noopener noreferrer" className="more__link">
                  <span className="more__name">{m.title}</span>
                  <span className="more__note">{m.note}</span>
                  <span className="more__stack mono">{m.stack}</span>
                  <Icon name="arrow" size={14} className="more__icon" />
                </a>
                {m.live && (
                  <a className="more__live mono" href={m.live} target="_blank" rel="noopener noreferrer">
                    <span className="live-dot" aria-hidden="true" />live demo ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {projects.map((p, i) => (
        <CaseSheet key={p.id} project={p} index={i} open={openSheet === p.id} onClose={() => setOpenSheet((cur) => (cur === p.id ? null : cur))} />
      ))}
    </section>
  );
}

