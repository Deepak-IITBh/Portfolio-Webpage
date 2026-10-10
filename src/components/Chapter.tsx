import type { ReactNode } from 'react';
import '../styles/components/Chapter.css';

interface ChapterProps {
  id: string;
  index: string;
  label: string;
  title: string;
  accent: string;
  intro?: string;
  children?: ReactNode;
}

/** Editorial chapter opener: mark, large title with one serif-italic accent word, short intro. */
export function Chapter({ id, index, label, title, accent, intro, children }: ChapterProps) {
  return (
    <header className="chapter" data-reveal>
      <p className="chapter__mark mono" aria-hidden="true">
        <span className="chapter__num">{index}</span>
        <span className="chapter__rule" />
        <span>{label}</span>
      </p>
      <div className="chapter__row">
        <h2 className="chapter__title" id={`${id}-title`}>
          <span className="mask">
            <span className="mask__in">
              {title} <span className="accent-word">{accent}</span>
            </span>
          </span>
        </h2>
        {intro && <p className="chapter__intro">{intro}</p>}
      </div>
      {children}
    </header>
  );
}
