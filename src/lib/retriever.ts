/**
 * A small, real BM25 retriever. It runs at build time (to pre-render the default query)
 * and in the browser (for live queries), over documents generated from the site's content.
 */

export interface Doc {
  id: string;
  title: string;
  kind: string;
  href: string;
  /** Weighted text: title is repeated so title matches rank higher. */
  text: string;
  /** Prior multiplier on the BM25 score (case studies are the most useful answer). */
  boost?: number;
  /** Domain cluster on the hero work map. */
  group: string;
}

export interface Hit {
  doc: Doc;
  score: number;
  matched: string[];
}

export interface Trace {
  tokens: string[];
  expanded: string[];
  candidates: number;
  hits: Hit[];
}

const STOP = new Set(
  'a an and are as at be by can do does for from has have how i in is it its me my of on or show tell that the this to was what when where which who why with you your about built build deepak work worked projects project'.split(' '),
);

/** Hand-written query expansion: domain synonyms, shown in the trace. */
const EXPAND: Record<string, string[]> = {
  rag: ['retrieval', 'faiss', 'vector'],
  retrieval: ['search', 'dpr'],
  search: ['retrieval'],
  llm: ['language', 'llama', 'gemini', 'groq'],
  llms: ['language', 'llama', 'gemini', 'groq'],
  genai: ['generative', 'llm'],
  generative: ['llm', 'agent'],
  agent: ['agentic', 'langgraph', 'routing'],
  agents: ['agentic', 'langgraph', 'routing'],
  vision: ['image', 'opencv', 'vlm'],
  cv: ['vision', 'image', 'opencv'],
  image: ['vision'],
  ocr: ['tesseract', 'document'],
  deploy: ['deployment', 'deployed', 'live', 'render', 'docker'],
  deployment: ['deployed', 'live', 'render', 'docker'],
  production: ['deployment', 'deployed', 'live'],
  deployed: ['deployment', 'live', 'render'],
  app: ['streamlit', 'application', 'live'],
  now: ['current', 'present'],
  current: ['present'],
  doing: ['current', 'present'],
  mlops: ['deployment', 'docker', 'render'],
  api: ['fastapi', 'rest', 'flask'],
  backend: ['fastapi', 'flask', 'api'],
  finetuning: ['peft', 'fine', 'tuning'],
  nlp: ['language', 'text', 'multilingual'],
  multilingual: ['languages', 'cross-lingual'],
  languages: ['multilingual'],
  experience: ['engineer', 'developer', 'intern'],
  job: ['engineer', 'developer', 'intern'],
  internship: ['intern'],
  metrics: ['mrr', 'ndcg', 'recall', 'benchmark'],
  results: ['mrr', 'ndcg', 'benchmark'],
  evaluation: ['benchmark', 'mrr', 'eval'],
  research: ['benchmark', 'paper'],
  legal: ['law', 'chatbot'],
  chatbot: ['legal', 'qa'],
  guardrails: ['guardrail', 'safety'],
  education: ['b.tech', 'iit'],
  hire: ['contact', 'email', 'role'],
  hiring: ['contact', 'email', 'role'],
  email: ['contact'],
  reach: ['contact', 'email'],
};

function stem(t: string): string {
  if (t.length > 5 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9.+]*[a-z0-9+]|[a-z0-9]/g) ?? [])
    .filter((t) => !STOP.has(t))
    .map(stem);
}

export class BM25 {
  private docs: Doc[];
  private tf: Map<string, number>[];
  private len: number[];
  private df = new Map<string, number>();
  private avgLen: number;

  constructor(docs: Doc[], private k1 = 1.2, private b = 0.75) {
    this.docs = docs;
    this.tf = docs.map((d) => {
      const m = new Map<string, number>();
      for (const t of tokenize(d.text)) m.set(t, (m.get(t) ?? 0) + 1);
      return m;
    });
    this.len = this.tf.map((m) => [...m.values()].reduce((a, b) => a + b, 0));
    this.avgLen = this.len.reduce((a, b) => a + b, 0) / Math.max(docs.length, 1);
    for (const m of this.tf) for (const t of m.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
  }

  get size() { return this.docs.length; }

  search(query: string, k = 4): Trace {
    const tokens = [...new Set(tokenize(query))];
    const expanded = [
      ...new Set(
        tokens
          .flatMap((t) => EXPAND[t] ?? EXPAND[t + 's'] ?? [])
          .map(stem)
          .filter((t) => !tokens.includes(t)),
      ),
    ];
    // Expansion terms count for less than the user's own words.
    const terms: [string, number][] = [...tokens.map((t): [string, number] => [t, 1]), ...expanded.map((t): [string, number] => [t, 0.4])];
    const N = this.docs.length;
    let candidates = 0;
    const hits: Hit[] = [];

    this.tf.forEach((tf, i) => {
      let score = 0;
      const matched: string[] = [];
      for (const [t, w] of terms) {
        const f = tf.get(t);
        if (!f) continue;
        const df = this.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += w * idf * ((f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * this.len[i]) / this.avgLen)));
        if (w === 1) matched.push(t);
      }
      if (score > 0) {
        score *= this.docs[i].boost ?? 1;
        candidates++;
        hits.push({ doc: this.docs[i], score, matched });
      }
    });

    hits.sort((a, b) => b.score - a.score);
    return { tokens, expanded, candidates, hits: hits.slice(0, k) };
  }
}
