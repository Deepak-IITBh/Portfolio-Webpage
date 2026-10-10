import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { PipelineNode } from '../data/projects';
import '../styles/components/Pipeline.css';

interface PipelineProps {
  id: string;
  nodes: PipelineNode[];
}

/** An architecture diagram you can inspect stage by stage (arrow keys move between stages). */
export function Pipeline({ id, nodes }: PipelineProps) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = (next + nodes.length) % nodes.length;
    buttons.current[target]?.focus();
    setSelected(target);
  };

  return (
    <div className="pipe" style={{ '--n': nodes.length } as CSSProperties}>
      <p className="pipe__hint mono"><span>Architecture</span><span className="pipe__hint-action">select a stage to inspect</span></p>
      <ol className="pipe__nodes">
        {nodes.map((node, i) => (
          <li key={node.id} className={`pipe__step${i < selected ? ' is-passed' : ''}`}>
            <button
              type="button"
              className="pnode"
              id={`${id}-tab-${node.id}`}
              aria-controls={`${id}-panel-${node.id}`}
              aria-pressed={i === selected}
              ref={(el) => { buttons.current[i] = el; }}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="pnode__idx mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="pnode__label">{node.label}</span>
              <span className="pnode__tech mono">{node.tech}</span>
              {node.branch && (
                <span className="pnode__branch mono">
                  {node.branch.map((b) => <span key={b}>{b}</span>)}
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
      <div className="pipe__panels">
        {nodes.map((node, i) => (
          <div
            key={node.id}
            className={`pipe__panel${i === selected ? ' is-active' : ''}`}
            id={`${id}-panel-${node.id}`}
            role="region"
            aria-label={`${node.label} stage`}
          >
            <p className="pipe__panel-head mono">{String(i + 1).padStart(2, '0')} · {node.label}</p>
            <p className="pipe__panel-body">{node.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
