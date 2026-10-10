import { Chapter } from './Chapter';
import { Icon } from './Icon';
import { experience } from '../data/site';
import '../styles/components/Experience.css';

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <Chapter id="experience" index="02" label="Experience" title="Where I’ve" accent="worked" intro="Data → research → AI, full-time." />

        <ol className="timeline">
          {experience.map((r) => (
            <li
              key={r.id}
              className={['entry', r.current ? 'is-current' : '', r.kind === 'Education' ? 'is-edu' : ''].filter(Boolean).join(' ')}
              id={`exp-${r.id}`}
              data-reveal
            >
              <div className="entry__when">
                <span className="entry__year" aria-hidden="true">{r.start.split(' ')[1]}</span>
                <span className="mono entry__range">{r.start} — {r.end}</span>
                <span className="mono entry__kind">{r.kind}</span>
              </div>
              <div className="entry__rail" aria-hidden="true"><span className="entry__node" /></div>
              <div className="entry__body">
                <h3 className="entry__title">
                  {r.title}
                  <span className="entry__org">{r.org}{r.place ? `, ${r.place}` : ''}</span>
                </h3>
                {r.current && (
                  <p className="entry__now mono"><span className="live-dot" aria-hidden="true" />Current role</p>
                )}
                <p className="entry__summary">{r.summary}</p>
                {r.points.length > 0 && (
                  <details className="entry__more">
                    <summary className="mono">What I did <span aria-hidden="true">+</span></summary>
                    <ul className="entry__points">
                      {r.points.map((pt) => <li key={pt}>{pt}</li>)}
                    </ul>
                  </details>
                )}
                {(r.stack.length > 0 || r.credential) && (
                  <div className="entry__foot">
                    {r.stack.length > 0 && <ul className="tag-list">{r.stack.map((s) => <li className="tag" key={s}>{s}</li>)}</ul>}
                    {r.credential && (
                      <a className="arrow-link" href={r.credential} target="_blank" rel="noopener noreferrer">
                        Certificate <Icon name="arrow" size={14} /><span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
