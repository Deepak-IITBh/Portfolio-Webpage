import type { CSSProperties } from 'react';
import { Chapter } from './Chapter';
import profilePhoto from '../assets/profile.webp';
import '../styles/components/About.css';

const PRINCIPLES = [
  { title: 'Measure before claiming', body: 'Every phase gets its own evaluation.' },
  { title: 'Ship the system, not the notebook', body: 'Behind an API or an app people can open.' },
  { title: 'Make failure explicit', body: 'Guardrails, schemas and fallbacks over guessing.' },
];

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <Chapter id="about" index="04" label="About" title="How I" accent="think" />

        <div className="about">
          <div className="about__text" data-reveal>
            <p className="about__lead">
              A smarter pipeline usually beats a bigger model. I care about what makes a model <em>useful</em>: the data, the evaluation, the deployment.
            </p>
            <div className="about__me">
              <img className="about__photo" src={profilePhoto} width={96} height={104} alt="Portrait of Deepak" loading="lazy" decoding="async" />
              <p className="about__facts mono">B.Tech, Data Science &amp; AI · IIT Bhilai, 2026 · Software Developer (R&amp;D)</p>
            </div>
          </div>

          <ol className="principles" aria-label="How I work">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} data-reveal style={{ '--reveal-delay': `${i * 70}ms` } as CSSProperties}>
                <span className="principles__num mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
