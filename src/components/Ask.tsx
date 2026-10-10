import { Console } from './Console';
import { corpus } from '../lib/search';
import '../styles/components/Ask.css';

/**
 * "Don't scroll. Ask." The keyless replacement for the old chatbot: a BM25 search that runs entirely
 * in the browser, so there is no API key (or model call) to leak.
 */
export function Ask() {
  return (
    <section className="ask" id="ask" aria-labelledby="ask-title">
      <div className="container ask__grid">
        <div className="ask__copy" data-reveal>
          <p className="ask__mark mono" aria-hidden="true"><span>00</span><span className="ask__rule" /><span>Ask</span></p>
          <h2 className="ask__title" id="ask-title">Don’t scroll. <span className="accent-word">Ask.</span></h2>
          <p className="ask__lead">This whole page, indexed. Searched in your browser.</p>
          <ol className="ask__chain mono" aria-label="How the search works">
            <li>tokenize</li><li>expand</li><li>bm25 · {corpus.length} docs</li><li>rank</li>
          </ol>
          <p className="ask__keys"><kbd className="kbd">/</kbd> here · <kbd className="kbd">Ctrl</kbd> <kbd className="kbd">K</kbd> anywhere</p>
        </div>
        <div className="ask__console" data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
          <Console />
        </div>
      </div>
    </section>
  );
}
