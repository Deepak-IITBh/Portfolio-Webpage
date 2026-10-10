import { BM25 } from './retriever';
import { buildCorpus, layoutMap, MAP_W, MAP_H } from './corpus';

/** One shared BM25 index over everything on the page (hero map + ⌘K palette). Built once, in the browser. */
export const corpus = buildCorpus();
export const index = new BM25(corpus);
export const layout = layoutMap(corpus);
export const docById = new Map(corpus.map((d) => [d.id, d]));
export const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));
export { MAP_W, MAP_H };

/** Scroll to a section, briefly highlight it and (optionally) move focus there. */
export function navigateTo(href: string, focus = false) {
  if (!href.startsWith('#')) {
    window.location.href = href;
    return;
  }
  const dest = document.querySelector<HTMLElement>(href);
  if (!dest) return;
  history.pushState(null, '', href);
  dest.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const target = dest.closest<HTMLElement>('.step, .entry, section') ?? dest;
  target.classList.remove('is-target');
  void target.offsetWidth;
  target.classList.add('is-target');
  window.setTimeout(() => target.classList.remove('is-target'), 2200);
  if (focus) {
    dest.setAttribute('tabindex', '-1');
    dest.focus({ preventScroll: true });
  }
}

/** Lets any component (nav, floating button) open the ⌘K palette. */
export const OPEN_PALETTE = 'open-palette';
export const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE));
