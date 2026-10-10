import { projects, moreWork } from '../data/projects';
import { experience, capabilities, profile } from '../data/site';
import type { Doc } from './retriever';

const weight = (title: string, body: string) => `${title} ${title} ${title} ${body}`;

const projectGroup: Record<string, string> = {
  dpr: 'retrieval',
  'meeting-agent': 'retrieval',
  'math-agent': 'agents',
  invoice: 'vision',
  attendance: 'vision',
};
const capabilityGroup: Record<string, string> = {
  'Retrieval / RAG': 'retrieval',
  NLP: 'retrieval',
  LLMs: 'agents',
  'Generative AI & Agents': 'agents',
  'Computer Vision': 'vision',
};
const moreGroup: Record<string, string> = {
  'Multilingual Assistive Image Captioning': 'vision',
  'ZeroShot Text-to-Image Generator': 'vision',
  'COVID-19 Chest X-ray Classification': 'vision',
};

/** Documents the console retrieves over: every case study, role, capability and section on the page. */
export function buildCorpus(): Doc[] {
  const docs: Doc[] = [];

  for (const p of projects) {
    docs.push({
      id: p.id,
      title: p.title.replace(' with LLM-Enhanced Hard Negatives', ''),
      kind: 'case study',
      href: `#${p.id}`,
      boost: 1.2,
      group: projectGroup[p.id] ?? 'foundations',
      text: weight(
        p.title,
        [p.tagline, p.problem, p.approach, p.domain.join(' '), p.stack.join(' '), p.keywords, ...p.pipeline.map((n) => `${n.label} ${n.tech}`)].join(' '),
      ),
    });
  }

  for (const m of moreWork) {
    docs.push({ id: `more-${m.title}`, title: m.title, kind: 'repository', href: '#more-work', group: moreGroup[m.title] ?? 'foundations', text: weight(m.title, `${m.note} ${m.stack}`) });
  }

  for (const r of experience) {
    docs.push({
      id: `exp-${r.id}`,
      title: r.kind === 'Education' ? 'B.Tech, Data Science & AI — IIT Bhilai' : `${r.title} — ${r.place ?? r.org}`,
      kind: r.kind === 'Education' ? 'education' : r.kind === 'Internship' ? 'internship' : 'role',
      href: `#exp-${r.id}`,
      group: 'career',
      text: weight(`${r.title} ${r.org}`, [r.kind, r.current ? 'current present now job' : '', r.summary, ...r.points, r.stack.join(' ')].join(' ')),
    });
  }

  for (const c of capabilities) {
    docs.push({
      id: `cap-${c.name}`,
      title: c.name,
      kind: 'capability',
      href: '#capabilities',
      group: capabilityGroup[c.name] ?? 'foundations',
      text: weight(c.name, `${c.build} ${c.stack.join(' ')}`),
    });
  }

  docs.push({
    id: 'contact',
    title: `Get in touch — ${profile.email}`,
    kind: 'contact',
    href: '#contact',
    group: 'people',
    text: weight('Contact', 'contact email reach hire role roles collaborate collaboration open opportunity work together resume linkedin github'),
  });

  return docs;
}

/* ───────────── Work map geometry ───────────── */

export interface MapNode {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: string;
}

export interface MapCluster {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Filled in by layoutMap: radius enclosing the cluster's nodes. */
  r?: number;
}

export const MAP_W = 600;
export const MAP_H = 330;

export const clusters: MapCluster[] = [
  { id: 'retrieval', label: 'Retrieval & NLP', x: 130, y: 105 },
  { id: 'agents', label: 'LLMs & Agents', x: 315, y: 78 },
  { id: 'vision', label: 'Vision', x: 488, y: 112 },
  { id: 'foundations', label: 'Foundations & systems', x: 168, y: 250 },
  { id: 'career', label: 'Career', x: 385, y: 248 },
  { id: 'people', label: 'People', x: 530, y: 262 },
];

const radius: Record<string, number> = { 'case study': 7, role: 5.5, internship: 5, education: 5, repository: 4.2, capability: 3.4, contact: 5 };

/** Deterministic sunflower layout inside each cluster; largest nodes sit at the centre. */
export function layoutMap(docs: Doc[]) {
  const nodes: MapNode[] = [];
  const halos: Required<MapCluster>[] = [];
  for (const c of clusters) {
    const members = docs.filter((d) => d.group === c.id).sort((a, b) => (radius[b.kind] ?? 4) - (radius[a.kind] ?? 4));
    members.forEach((d, i) => {
      const dist = i === 0 ? 0 : 19 * Math.sqrt(i + 0.3);
      const angle = i * 2.39996 + 0.6;
      nodes.push({ id: d.id, x: +(c.x + dist * Math.cos(angle)).toFixed(1), y: +(c.y + dist * Math.sin(angle) * 0.82).toFixed(1), r: radius[d.kind] ?? 4, kind: d.kind });
    });
    const far = Math.max(0, ...nodes.filter((n) => members.some((m) => m.id === n.id)).map((n) => Math.hypot(n.x - c.x, n.y - c.y) + n.r));
    halos.push({ ...c, r: Math.round(far + 14) });
  }

  // Edges: a capability links to the work that evidences it.
  const byHref = new Map(docs.map((d) => [d.href, d.id]));
  const edges: [string, string][] = [];
  for (const c of capabilities) {
    for (const e of c.evidence) {
      if (e.href === '#more-work') continue;
      const target = e.href.startsWith('#exp-') ? e.href.slice(1) : byHref.get(e.href);
      if (target) edges.push([`cap-${c.name}`, target]);
    }
  }
  return { nodes, edges, halos };
}
