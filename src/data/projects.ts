import dprFull from '../assets/projects/dpr-architecture.png';
import dpr960png from '../assets/projects/dpr-architecture-960.png';
import dpr640avif from '../assets/projects/dpr-architecture-640.avif';
import dpr960avif from '../assets/projects/dpr-architecture-960.avif';
import dpr1644avif from '../assets/projects/dpr-architecture-1644.avif';
import dpr640webp from '../assets/projects/dpr-architecture-640.webp';
import dpr960webp from '../assets/projects/dpr-architecture-960.webp';
import dpr1644webp from '../assets/projects/dpr-architecture-1644.webp';

/** Responsive image sources for a diagram (AVIF / WebP with a PNG fallback). */
export interface DiagramImage {
  full: string;
  fallback: string;
  width: number;
  height: number;
  avif: string;
  webp: string;
  alt: string;
}

/**
 * Engineering case studies. Facts come from the resume and each repository's README / source.
 * Metrics carry a `source` so every number on the site can be traced.
 */

export interface PipelineNode {
  id: string;
  label: string;
  tech: string;
  detail: string;
  /** Marks a stage that branches, e.g. a router. */
  branch?: string[];
}

export interface Metric {
  value: string;
  label: string;
  source: string;
}

export interface Decision {
  choice: string;
  why: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  kind: string;
  domain: string[];
  problem: string;
  approach: string;
  pipeline: PipelineNode[];
  decisions: Decision[];
  metrics: Metric[];
  results?: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** Extra retrieval terms for the in-page console. */
  keywords: string;
  /** Compact spec sheet shown on the page; full prose lives in the case-study sheet. */
  spec: [string, string][];
  /** Optional system diagram (from the project's own repository). */
  diagram?: DiagramImage;
}

const gh = (repo: string) => `https://github.com/Deepak-IITBh/${repo}`;

export const projects: Project[] = [
  {
    id: 'dpr',
    diagram: {
      full: dprFull,
      fallback: dpr960png,
      width: 1644,
      height: 638,
      avif: `${dpr640avif} 640w, ${dpr960avif} 960w, ${dpr1644avif} 1644w`,
      webp: `${dpr640webp} 640w, ${dpr960webp} 960w, ${dpr1644webp} 1644w`,
      alt: 'System architecture of the Multilingual DPR project. Data preparation: MS MARCO preprocessing feeds BM25 negative mining, and LLM query augmentation feeds synthetic negative generation. Model training: a dense passage retriever is trained, and a final training dataset is used to train the LLM model. Retrieval pipeline: passage encoding, indexing and RAG re-ranking lead to the trained RAG model. Model improvement: fine-tuning on TyDi and multilingual tasks. Evaluation: in-domain, out-of-domain and zero-shot.',
    },
    spec: [['Encoder', 'mBERT dual encoder · FP16'], ['Negatives', 'BM25 → LLM filter → RAG rank'], ['LLM', 'llama3.1:8b via Ollama'], ['Index', 'FAISS IndexFlatIP'], ['Eval', 'MRR@10 · Recall@K · nDCG@10']],
    title: 'Multilingual Dense Passage Retrieval with LLM-Enhanced Hard Negatives',
    tagline: 'Teaching a retriever what “almost right” looks like, across 15+ languages.',
    kind: 'Research · team of 3',
    domain: ['Retrieval', 'LLMs', 'Multilingual NLP'],
    problem:
      'Dense retrievers learn from hard negatives, and those are usually mined with BM25. Lexical mining produces false negatives (passages that are actually relevant) and semantically weak ones, which teaches the model the wrong boundary. The effect is worse in low-resource languages.',
    approach:
      'Extend DPR training with a progressive mining pipeline: BM25 candidates are filtered by an LLM classifier, augmented with query-conditioned negatives the LLM writes itself, then re-ranked with FAISS-retrieved context before training a multilingual dual encoder and fine-tuning it on TyDi QA.',
    pipeline: [
      {
        id: 'data',
        label: 'Corpora',
        tech: 'MS MARCO · TyDi QA · mMARCO',
        detail:
          'English MS MARCO for training and evaluation, TyDi QA for multilingual fine-tuning, and mMARCO for zero-shot evaluation, with automated validation and quality filtering during preprocessing.',
      },
      {
        id: 'bm25',
        label: 'BM25 mining',
        tech: 'BM25Okapi · top-100',
        detail:
          'Baseline hard negatives: top-100 lexical candidates per query with exact positive matches removed. This is the reference every later phase is measured against.',
      },
      {
        id: 'llm',
        label: 'LLM classification',
        tech: 'Ollama · llama3.1:8b',
        detail:
          'Each candidate is scored HARD (70–100) or EASY (0–30) so false negatives are filtered out, and the LLM generates 3 query-conditioned hard negatives per sample: topically related but factually wrong. Progress is checkpointed every 100 samples.',
      },
      {
        id: 'rag',
        label: 'RAG ranking',
        tech: 'FAISS IndexFlatIP · top-3 context',
        detail:
          'A FAISS index over the negatives corpus retrieves the 3 most similar passages per query; the LLM scores each negative with that context and only the top 50% are kept for training.',
      },
      {
        id: 'train',
        label: 'Dual-encoder training',
        tech: 'mBERT · contrastive · FP16',
        detail:
          'bert-base-multilingual-cased query and passage encoders trained contrastively with in-batch plus mined hard negatives, using AdamW with linear warm-up and FP16 mixed precision.',
      },
      {
        id: 'eval',
        label: 'Multilingual evaluation',
        tech: 'MRR@10 · Recall@K · nDCG@10',
        detail:
          'Each phase is evaluated separately on MS MARCO, then on TyDi QA languages split into in-distribution, out-of-distribution and zero-shot groups.',
      },
    ],
    decisions: [
      {
        choice: 'Use an LLM as a quality gate, not only as a generator',
        why: 'False negatives actively mislead contrastive training. Filtering them attacks BM25’s lexical bias at the source instead of hoping the model learns around it.',
      },
      {
        choice: 'Run the LLM locally through Ollama',
        why: 'Classifying and generating negatives for 1,000+ samples is a long batch job; a local 8B model scales it without per-call API costs, with checkpoints for resilience.',
      },
      {
        choice: 'Ship each phase as its own trainable model',
        why: 'Progressive phases make every gain attributable: the benchmark compares BM25 → LLM → RAG directly instead of reporting one final number.',
      },
    ],
    metrics: [
      { value: '+383%', label: 'MRR@10 over BM25 on MS MARCO (RAG-enhanced)', source: 'Repository README · 300-sample eval' },
      { value: '87.5%', label: 'accuracy of LLM negative classification', source: 'Resume' },
      { value: '−50%', label: 'false negatives in mined training data', source: 'Resume' },
      { value: '15+', label: 'languages in multilingual evaluation', source: 'Resume · README' },
    ],
    results:
      'Progressive enhancement improved MRR@10 by 49.4%, with a 19% zero-shot gain in multilingual transfer. No single model wins everywhere: RAG-enhanced negatives lead in-distribution, while LLM-enhanced negatives transfer best to unseen languages.',
    stack: ['PyTorch', 'FAISS', 'Ollama', 'Hugging Face Transformers', 'sentence-transformers', 'CUDA'],
    links: [{ label: 'Source', href: gh('Multilingual-DPR-Retrieval-System-with-LLM-Enhanced-Hard-Negatives') }],
    keywords:
      'dense passage retrieval dpr rag faiss hard negatives multilingual cross-lingual semantic search llm ollama llama mrr ndcg recall benchmark evaluation research contrastive bert msmarco tydi zero-shot languages',
  },
  {
    id: 'math-agent',
    spec: [['Graph', 'LangGraph state machine'], ['Routing', 'knowledge base → web fallback'], ['Guardrails', 'input + output'], ['Model', 'Gemini 2.0 Flash · JSON steps'], ['Feedback', 'human ratings via /feedback']],
    title: 'Math Routing Agent',
    tagline: 'An agentic-RAG tutor that knows when to look something up, and when to refuse.',
    kind: 'Agent system',
    domain: ['AI Agents', 'RAG', 'Guardrails'],
    problem:
      'A tutoring assistant should explain maths step by step, stay strictly on-topic, and never invent an answer it cannot ground. A single prompt to an LLM gives none of those guarantees.',
    approach:
      'A LangGraph state machine wraps the model: an input guardrail rejects non-maths or unsafe queries, a vector knowledge base is searched first, a router falls back to web search on a miss, and the generator returns structured steps with a source and a full route log. A feedback endpoint captures human ratings for every answer.',
    pipeline: [
      {
        id: 'guard-in',
        label: 'Input guardrail',
        tech: 'keyword + symbol policy',
        detail: 'Rejects unsafe or off-topic queries before any model call, so the agent stays an education tool.',
      },
      {
        id: 'kb',
        label: 'Knowledge base',
        tech: 'Chroma · text-embedding-004',
        detail: 'Questions are embedded and matched against a curated maths knowledge base first, because grounded answers beat generated ones.',
      },
      {
        id: 'router',
        label: 'Router',
        tech: 'LangGraph conditional edge',
        detail: 'On a knowledge-base hit the graph goes straight to generation; on a miss it routes to web search. Every hop is appended to a route log returned with the answer.',
        branch: ['KB hit → generate', 'miss → web search'],
      },
      {
        id: 'web',
        label: 'Web search',
        tech: 'Tavily API',
        detail: 'Fetches external context only when the knowledge base cannot answer, with failure recorded in the route log rather than hidden.',
      },
      {
        id: 'gen',
        label: 'Step-wise generation',
        tech: 'Gemini 2.0 Flash · JSON',
        detail: 'Produces a solution, explicit steps, a source and a confidence score. If structured parsing fails, the graph falls back to web search instead of returning malformed output.',
      },
      {
        id: 'feedback',
        label: 'Human feedback',
        tech: 'FastAPI /feedback',
        detail: 'Users rate each response; ratings are stored per query id to drive refinement (human-in-the-loop). An evaluation script runs the agent against JEE Bench questions.',
      },
    ],
    decisions: [
      {
        choice: 'Model the agent as an explicit graph',
        why: 'A LangGraph state machine makes routing inspectable and testable, and the route log makes every answer explainable.',
      },
      {
        choice: 'Knowledge base before web search',
        why: 'Retrieval from curated material is cheaper and more trustworthy; the web is a fallback, not the default.',
      },
      {
        choice: 'Guardrails on both sides of the model',
        why: 'Input checks keep the agent on-topic, and output checks reject empty or degenerate answers before they reach a student.',
      },
    ],
    metrics: [],
    stack: ['LangGraph', 'LangChain', 'FastAPI', 'Gemini', 'Chroma', 'Tavily', 'Pydantic'],
    links: [{ label: 'Source', href: gh('Math-Routing-Agent') }],
    keywords:
      'agent agentic rag routing router langgraph langchain guardrails guardrail human-in-the-loop feedback web search tavily gemini chroma vector fastapi math tutor jee bench',
  },
  {
    id: 'meeting-agent',
    spec: [['Input', 'MP4 · AVI · MOV · MKV'], ['Retrieval', 'sentence-transformers + FAISS top-k'], ['LLM', 'Groq'], ['Output', 'summary · action items · Q&A'], ['UI', 'Streamlit']],
    title: 'AI-Powered Meeting Intelligence Agent',
    tagline: 'Turn an hour of meeting video into a summary, action items and a searchable memory.',
    kind: 'Product prototype',
    domain: ['RAG', 'NLP', 'LLMs'],
    problem:
      'Meeting recordings usually just get stored. The decisions and action items inside them are hard to get back to.',
    approach:
      'A modular pipeline extracts audio from the uploaded video, transcribes it, generates a summary and action items with an LLM, and indexes the transcript so people can ask questions in natural language.',
    pipeline: [
      { id: 'upload', label: 'Video upload', tech: 'MP4 · AVI · MOV · MKV', detail: 'Streamlit front end accepts common video formats and orchestrates the workflow.' },
      { id: 'audio', label: 'Audio → transcript', tech: 'video_processor.py', detail: 'Extracts the audio track and produces a transcript that every later stage works from.' },
      { id: 'insight', label: 'Insight generation', tech: 'Groq LLM', detail: 'Generates a concise summary and extracts structured action items from the transcript.' },
      { id: 'index', label: 'Semantic index', tech: 'sentence-transformers · FAISS', detail: 'Transcript chunks are embedded and stored in a FAISS index for similarity search.' },
      { id: 'qa', label: 'Q&A', tech: 'top-k retrieval + LLM', detail: 'Questions retrieve the top-k most similar transcript chunks, which ground the LLM’s answer.' },
    ],
    decisions: [
      { choice: 'Separate modules per stage', why: 'Video processing, RAG and LLM utilities live in their own files, so each stage can be swapped or tested in isolation.' },
      { choice: 'Ground Q&A in retrieved transcript chunks', why: 'Answers cite what was actually said in the meeting instead of relying on the model’s memory.' },
    ],
    metrics: [],
    stack: ['Python', 'Streamlit', 'Groq', 'FAISS', 'sentence-transformers'],
    links: [
      { label: 'Source', href: gh('AI-Meeting-Intelligence-Agent') },
      { label: 'Demo video', href: 'https://drive.google.com/file/d/1YrrUMA2tLA7umMnUs6FxJpGZAt5BJ-Sb/view?usp=sharing' },
    ],
    keywords:
      'meeting transcript summary summarisation action items rag faiss sentence-transformers groq llm question answering qa video audio streamlit nlp semantic search',
  },
  {
    id: 'invoice',
    spec: [['Model', 'LLaMA 3.2 Vision via Groq'], ['Validation', 'Pydantic schemas'], ['Batch', 'ZIP uploads'], ['Export', 'JSON · CSV'], ['Status', 'live on Render']],
    title: 'Invoice Extraction with LLaMA 3.2 Vision',
    tagline: 'From a folder of invoice images to validated, structured data.',
    kind: 'Deployed application',
    domain: ['Computer Vision', 'LLMs', 'Deployment'],
    problem:
      'Invoice data is locked inside images. Manual entry is slow, and generic OCR loses the structure that makes the data useful.',
    approach:
      'A vision-language model reads each invoice and returns structured fields, Pydantic schemas validate the output, and results are exported as JSON or CSV. ZIP uploads enable batch processing.',
    pipeline: [
      { id: 'in', label: 'Upload', tech: 'images · ZIP batches', detail: 'Single invoices or a ZIP of many are accepted, so batches are processed in one pass.' },
      { id: 'vlm', label: 'Vision extraction', tech: 'LLaMA 3.2 Vision · Groq', detail: 'The vision-language model reads the invoice image directly and extracts its fields.' },
      { id: 'validate', label: 'Validation', tech: 'Pydantic', detail: 'Typed schemas reject or normalise malformed fields so downstream data stays clean.' },
      { id: 'export', label: 'Export', tech: 'JSON · CSV', detail: 'Structured results download in formats that drop straight into spreadsheets or other systems.' },
      { id: 'deploy', label: 'Deployment', tech: 'Streamlit · Render', detail: 'Deployed publicly on Render as a working web app.' },
    ],
    decisions: [
      { choice: 'Validate model output with schemas', why: 'LLM output is probabilistic; Pydantic turns it into a contract the rest of the system can trust.' },
      { choice: 'Batch via ZIP upload', why: 'Real users have folders of invoices, not one image at a time.' },
    ],
    metrics: [],
    stack: ['Python', 'LLaMA 3.2 Vision', 'Groq', 'Pydantic', 'Streamlit', 'Render'],
    links: [
      { label: 'Live app', href: 'https://ai-agent-for-invoice-gneration.onrender.com/' },
      { label: 'Source', href: gh('Ai-agent-for-Invoice-Gneration') },
    ],
    keywords:
      'invoice extraction vision llama vlm vision-language document ocr structured data pydantic validation json csv batch zip streamlit render deployed live computer vision',
  },
  {
    id: 'attendance',
    spec: [['Marks', 'OpenCV OMR · circle fill'], ['Roll numbers', 'Tesseract, local'], ['API', 'Flask → JSON'], ['Network', 'fully offline'], ['Fallback', 'row index if OCR fails']],
    title: 'Offline Attendance Sheet Reader',
    tagline: 'Deterministic computer vision where a model would be overkill.',
    kind: 'Proof of concept',
    domain: ['Computer Vision', 'OCR'],
    problem:
      'Paper attendance sheets must be digitised, but the setting can’t rely on cloud APIs or an internet connection.',
    approach:
      'A fully offline OpenCV OMR engine reads circle marks from a photo of the sheet, local Tesseract OCR reads roll numbers, and a Flask API returns a present/absent table as JSON.',
    pipeline: [
      { id: 'pre', label: 'Preprocess', tech: 'OpenCV', detail: 'Resize, denoise, enhance contrast, deskew and optionally binarise so marks are easier to read.' },
      { id: 'grid', label: 'Grid detection', tech: 'rule lines · table structure', detail: 'Finds rows, columns and headers from the table’s rule lines.' },
      { id: 'marks', label: 'Mark classification', tech: 'circle fill', detail: 'Filled, shaded or scribbled circles are marked present and open circles absent.' },
      { id: 'ocr', label: 'Roll-number OCR', tech: 'Tesseract (local)', detail: 'Reads roll numbers locally and falls back to row indices if OCR fails.' },
      { id: 'json', label: 'Structured output', tech: 'Flask · JSON', detail: 'Returns roll numbers with daily attendance state and exposes a health-check endpoint.' },
    ],
    decisions: [
      { choice: 'Deterministic OMR instead of a vision-language model', why: 'Marks are a constrained visual signal; classical CV is explainable, fast, free and works offline.' },
      { choice: 'Explicit fallbacks and documented limits', why: 'If OCR fails, rows are still numbered; known failure cases are written down rather than hidden.' },
    ],
    metrics: [],
    stack: ['Python', 'OpenCV', 'Tesseract', 'Flask', 'Gunicorn'],
    links: [{ label: 'Source', href: gh('vision-attendance-system') }],
    keywords:
      'attendance omr opencv computer vision ocr tesseract offline flask grid detection image preprocessing deskew document classical cv',
  },
];

export interface MinorProject {
  title: string;
  note: string;
  stack: string;
  href: string;
  live?: string;
}

export const moreWork: MinorProject[] = [
  {
    title: 'Multilingual Assistive Image Captioning',
    note: 'Describes images in Indian languages and narrates them aloud for visually impaired users.',
    stack: 'ViT + GPT-2 · IndicTrans2 · gTTS · Flask',
    href: gh('Multilingual-Assistive-Image-Captioning-Model'),
  },
  {
    title: 'TurboGNN',
    note: 'Fast GNN training via GPU-based sampling, with experiments on ogbn-arxiv, LiveJournal and Google+ graphs.',
    stack: 'CUDA · GNNs',
    href: gh('TURBOGNN-FAST-AND-EFFICIENT-GNN-TRAINING-VIA-GPU-SAMPLING'),
  },
  {
    title: 'ZeroShot Text-to-Image Generator',
    note: 'Course project: text-to-image synthesis with Stable Diffusion, a CLIP ViT-L/14 encoder, U-Net and VAE, optimised with OpenVINO.',
    stack: 'Stable Diffusion · CLIP · OpenVINO · Hugging Face',
    href: gh('Zeroshot-Text-to-ImageAI'),
  },
  {
    title: 'COVID-19 Chest X-ray Classification',
    note: 'Fine-tuned MobileNetV2 on 1,823 chest X-rays (normal, COVID-19, viral pneumonia): 95% accuracy, precision, recall and F1.',
    stack: 'MobileNetV2 · Transfer learning · Keras',
    href: gh('transfer-learning-covid-19-cxr-classification'),
  },
  {
    title: 'Virtual Restaurant Queue Manager',
    note: 'Digital queueing, ordering and live order tracking with a restaurant dashboard.',
    stack: 'Go · Gin · MongoDB · React',
    href: gh('Virtual-Restaurant-Queue-Manager'),
    live: 'https://virtual-restaurant-queue-manager.onrender.com/',
  },
  {
    title: 'Blood Bank Management System',
    note: 'Full-stack system with role-based access and inventory management.',
    stack: 'JavaScript',
    href: gh('blood-bank-management-system'),
  },
];

/** DPR benchmark tables, copied from the repository README. */
export const dprBenchmarks = {
  models: ['BM25 baseline', 'LLM-enhanced', 'RAG-enhanced'],
  metrics: ['MRR@10', 'Recall@10', 'nDCG@10'] as const,
  splits: [
    {
      id: 'msmarco',
      label: 'MS MARCO',
      note: 'English · 300 samples',
      values: { 'MRR@10': [0.0259, 0.0713, 0.1237], 'Recall@10': [0.063, 0.25, 0.307], 'nDCG@10': [0.0346, 0.1129, 0.1662] },
    },
    {
      id: 'in-dist',
      label: 'In-distribution',
      note: 'TyDi QA · Swahili, Bengali, Telugu',
      values: { 'MRR@10': [0.443, 0.4278, 0.4452], 'Recall@10': [0.743, 0.747, 0.76], 'nDCG@10': [0.5153, 0.5045, 0.5215] },
    },
    {
      id: 'ood',
      label: 'Out-of-distribution',
      note: 'TyDi QA · Arabic, Japanese, Indonesian, Russian',
      values: { 'MRR@10': [0.3661, 0.4398, 0.4304], 'Recall@10': [0.669, 0.762, 0.743], 'nDCG@10': [0.4376, 0.5164, 0.5052] },
    },
    {
      id: 'zero-shot',
      label: 'Zero-shot',
      note: 'Chinese, French, Dutch, German',
      values: { 'MRR@10': [0.3315, 0.4698, 0.4552], 'Recall@10': [0.645, 0.771, 0.752], 'nDCG@10': [0.4059, 0.5472, 0.5306] },
    },
  ],
};
