import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { index, docById, navigateTo, OPEN_PALETTE } from '../lib/search';
import '../styles/components/Palette.css';

const FEATURED = ['dpr', 'math-agent', 'meeting-agent', 'invoice', 'attendance', 'exp-rnd', 'contact'];

/** ⌘K search palette: the same BM25 index as the hero console, reachable from anywhere on the page. */
export function Palette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return FEATURED.map((id) => docById.get(id)).filter((d) => !!d).map((doc) => ({ doc: doc!, why: '' }));
    }
    return index.search(q, 7).hits.map((h) => ({
      doc: h.doc,
      why: h.matched.length ? `matched ${h.matched.join(', ')} · ${h.score.toFixed(2)}` : `via synonyms · ${h.score.toFixed(2)}`,
    }));
  }, [query]);

  const open = useCallback(() => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    setQuery('');
    setActive(0);
    d.showModal();
    inputRef.current?.focus();
  }, []);

  const go = useCallback((i: number) => {
    const item = items[i];
    if (!item) return;
    dialogRef.current?.close();
    navigateTo(item.doc.href, true);
  }, [items]);

  useEffect(() => {
    const onOpen = () => open();
    const onKey = (e: KeyboardEvent) => {
      const d = dialogRef.current;
      if (!d) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (d.open) d.close();
        else open();
        return;
      }
      const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]');
      if (e.key === '/' && !typing && !e.defaultPrevented) {
        const hero = document.querySelector('.inst')?.getBoundingClientRect();
        const heroVisible = !!hero && hero.bottom > 0 && hero.top < innerHeight;
        if (!heroVisible) {
          e.preventDefault();
          open();
        }
      }
    };
    window.addEventListener(OPEN_PALETTE, onOpen);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(OPEN_PALETTE, onOpen);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`#p-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <dialog
      className="palette"
      ref={dialogRef}
      aria-labelledby="palette-label"
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="palette__box">
        <div className="palette__head">
          <Icon name="search" />
          <label id="palette-label" htmlFor="palette-input" className="sr-only">Search everything on this page</label>
          <input
            id="palette-input"
            ref={inputRef}
            className="palette__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={items.length ? `p-opt-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search projects, roles, skills…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (!items.length) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => (a + 1) % items.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => (a - 1 + items.length) % items.length);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                go(active);
              }
            }}
          />
          <kbd className="kbd">esc</kbd>
        </div>
        <ul id="palette-list" className="palette__list" role="listbox" aria-label="Results" ref={listRef}>
          {items.length ? (
            items.map(({ doc, why }, i) => (
              <li
                key={doc.id}
                id={`p-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onClick={() => go(i)}
                onMouseMove={() => i !== active && setActive(i)}
              >
                <span className="p-title">{doc.title}</span>
                <span className="p-kind">{doc.kind}</span>
                {why && <span className="p-why">{why}</span>}
              </li>
            ))
          ) : (
            <li className="p-empty" role="option" aria-disabled="true" aria-selected="false">No matches. Try “retrieval”, “vision” or “agents”.</li>
          )}
        </ul>
        <p className="palette__foot mono">
          <span>bm25 · runs locally</span>
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> move <kbd className="kbd">↵</kbd> open
          </span>
        </p>
      </div>
    </dialog>
  );
}
