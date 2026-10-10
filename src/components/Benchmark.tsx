import { useState, type CSSProperties } from 'react';
import { dprBenchmarks as bench } from '../data/projects';
import '../styles/components/Benchmark.css';

type Metric = (typeof bench.metrics)[number];

const fmt = (m: string, v: number) => (m === 'Recall@10' ? `${(v * 100).toFixed(1)}%` : v.toFixed(4));
const tick = (m: string, v: number) => (m === 'Recall@10' ? `${Math.round(v * 100)}%` : String(+v.toFixed(3)));
const TICKS = [0, 0.25, 0.5, 0.75, 1];

function niceMax(values: number[]) {
  const max = Math.max(...values);
  const step = max <= 0.15 ? 0.05 : max <= 0.6 ? 0.1 : 0.2;
  return Math.ceil((max * 1.08) / step) * step;
}

/** Interactive DPR benchmark: pick an evaluation set and a metric; values come straight from the repository README. */
export function Benchmark() {
  const [splitId, setSplitId] = useState(bench.splits[0].id);
  const [metric, setMetric] = useState<Metric>(bench.metrics[0]);

  const split = bench.splits.find((s) => s.id === splitId) ?? bench.splits[0];
  const values = split.values[metric];
  const max = niceMax(values);
  const best = values.indexOf(Math.max(...values));
  const summary = `${split.label}, ${metric}: ${bench.models.map((m, i) => `${m} ${fmt(metric, values[i])}`).join(', ')}`;

  return (
    <figure className="bench">
      <figcaption className="bench__head">
        <div>
          <p className="bench__title">Retrieval quality by hard-negative strategy</p>
          <p className="bench__sub mono">{split.note} · {metric}</p>
        </div>
        <div className="bench__controls">
          <div className="seg" role="group" aria-label="Evaluation set">
            {bench.splits.map((s) => (
              <button key={s.id} type="button" className="seg__btn" aria-pressed={s.id === splitId} onClick={() => setSplitId(s.id)}>{s.label}</button>
            ))}
          </div>
          <div className="seg" role="group" aria-label="Metric">
            {bench.metrics.map((m) => (
              <button key={m} type="button" className="seg__btn mono" aria-pressed={m === metric} onClick={() => setMetric(m)}>{m}</button>
            ))}
          </div>
        </div>
      </figcaption>

      <div className="chart" aria-hidden="true">
        <div className="chart__rows">
          {bench.models.map((model, i) => (
            <div key={model} className={`chart__row${i === best ? ' is-best' : ''}`}>
              <span className="chart__label">{model}</span>
              <span className="chart__track">
                <span className="chart__bar" style={{ '--w': `${(values[i] / max) * 100}%` } as CSSProperties} />
              </span>
              <span className="chart__value mono">{fmt(metric, values[i])}</span>
            </div>
          ))}
        </div>
        <div className="chart__axis mono">
          <span />
          <span className="chart__ticks">
            {TICKS.map((f) => <span key={f}>{tick(metric, max * f)}</span>)}
          </span>
          <span />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{summary}</p>

      <details className="bench__table">
        <summary className="mono">View all results as a table</summary>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">DPR evaluation results by evaluation set, model and metric</caption>
            <thead>
              <tr>
                <th scope="col">Evaluation set</th>
                <th scope="col">Model</th>
                {bench.metrics.map((m) => <th key={m} scope="col">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {bench.splits.map((s) =>
                bench.models.map((model, i) => (
                  <tr key={`${s.id}-${model}`}>
                    {i === 0 && (
                      <th scope="rowgroup" rowSpan={bench.models.length}>{s.label}<span className="muted"> · {s.note}</span></th>
                    )}
                    <td>{model}</td>
                    {bench.metrics.map((m) => <td key={m} className="mono">{fmt(m, s.values[m][i])}</td>)}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
      <p className="bench__source mono">Source: repository README. MS MARCO run on 300 samples.</p>
    </figure>
  );
}
