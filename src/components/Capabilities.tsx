import { useEffect, useRef } from 'react';
import { Chapter } from './Chapter';
import { capabilities, languages, evidenceColumns } from '../data/site';
import '../styles/components/Capabilities.css';

const GROUPS = [
  { label: 'Projects', span: evidenceColumns.filter((c) => c.group === 'Projects').length },
  { label: 'Roles', span: evidenceColumns.filter((c) => c.group === 'Roles').length },
];
const ROLE_START = 'exp-rnd';

export function Capabilities() {
  const tableRef = useRef<HTMLTableElement>(null);

  // Highlight a whole column when hovering any of its cells (wide screens only).
  useEffect(() => {
    const table = tableRef.current;
    if (!table || !matchMedia('(min-width: 760px)').matches) return;
    let hot = -1;
    const set = (i: number) => {
      if (i === hot) return;
      hot = i;
      table.querySelectorAll('.col-hot').forEach((c) => c.classList.remove('col-hot'));
      if (i < 1) return;
      table.querySelectorAll<HTMLTableRowElement>('.matrix__cols, tbody tr').forEach((row) => row.cells[i]?.classList.add('col-hot'));
    };
    const over = (e: PointerEvent) => {
      const cell = (e.target as HTMLElement).closest<HTMLTableCellElement>('td, .matrix__cols th');
      set(cell ? cell.cellIndex : -1);
    };
    const leave = () => set(-1);
    table.addEventListener('pointerover', over);
    table.addEventListener('pointerleave', leave);
    return () => {
      table.removeEventListener('pointerover', over);
      table.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <section className="section" id="capabilities" aria-labelledby="capabilities-title">
      <div className="container">
        <Chapter id="capabilities" index="03" label="Capabilities" title="What I can" accent="build" intro="Every dot is a place I actually used it.">
          <p className="langs mono">Writes in {languages.join(' · ')}</p>
        </Chapter>

        <div className="matrix-wrap" data-reveal>
          <table className="matrix" ref={tableRef}>
            <caption className="sr-only">Capabilities and the projects or roles where each was used</caption>
            <colgroup>
              <col className="matrix__col-cap" />
              {evidenceColumns.map((c) => <col key={c.id} />)}
            </colgroup>
            <thead>
              <tr className="matrix__groups">
                <td />
                {GROUPS.map((g) => <th key={g.label} scope="colgroup" colSpan={g.span} className="mono">{g.label}</th>)}
              </tr>
              <tr className="matrix__cols">
                <th scope="col" className="mono matrix__corner">Capability</th>
                {evidenceColumns.map((c) => (
                  <th key={c.id} scope="col" className={['mono', c.id === ROLE_START ? 'is-group-start' : ''].join(' ').trim()}>
                    <a href={c.href}>{c.label}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap) => (
                <tr key={cap.name}>
                  <th scope="row" className="matrix__cap">
                    <span className="matrix__cap-in">
                      <span className="matrix__name">{cap.name}</span>
                      <span className="matrix__stack mono">{cap.stack.join(' · ')}</span>
                    </span>
                  </th>
                  {evidenceColumns.map((c) => {
                    const used = (cap.uses as readonly string[]).includes(c.id);
                    return (
                      <td key={c.id} className={[used ? 'is-used' : '', c.id === ROLE_START ? 'is-group-start' : ''].join(' ').trim()} data-label={c.label}>
                        {used ? <span className="dot" role="img" aria-label={`used in ${c.label}`} /> : <span className="sr-only">not used</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
