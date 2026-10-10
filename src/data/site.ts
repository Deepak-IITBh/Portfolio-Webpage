/**
 * Single source of truth for profile content.
 * Every fact here is taken from Deepak's resume (Oct 2026) or public GitHub repositories.
 */

export const profile = {
  name: 'Deepak',
  role: 'AI / Machine Learning Engineer',
  location: 'Bhilai, India',
  email: 'deepakde@iitbhilai.ac.in',
  statement: 'I build AI systems that actually work — and measure them to prove it.',
  summary:
    'Retrieval systems, LLM agents and vision pipelines, taken from research idea to deployed product, with the evaluation to show what every change was worth.',
  description:
    'Deepak is an AI / Machine Learning Engineer building retrieval systems, LLM agents and computer-vision pipelines. Software Developer (R&D) at IIT Bhilai.',
  now: {
    label: 'Software Developer (R&D)',
    org: 'IIT Bhilai',
  },
};

export const links = {
  github: 'https://github.com/Deepak-IITBh',
  linkedin: 'https://www.linkedin.com/in/deepak-k-4767a525b/',
  leetcode: 'https://leetcode.com/u/deepakde/',
  resume: '/Deepak_Resume.pdf',
  certificate: '/Provisional_Certificate.pdf',
  email: `mailto:${profile.email}`,
};

export interface Role {
  id: string;
  title: string;
  org: string;
  place?: string;
  kind: 'Full-time' | 'Internship' | 'Education';
  start: string;
  end: string;
  current?: boolean;
  summary: string;
  points: string[];
  stack: string[];
  credential?: string;
}

export const experience: Role[] = [
  {
    id: 'rnd',
    title: 'Software Developer (R&D)',
    org: 'IIT Bhilai',
    kind: 'Full-time',
    start: 'Aug 2026',
    end: 'Present',
    current: true,
    summary: 'Developing AI/ML solutions focused on Generative AI, NLP and computer vision.',
    points: [
      'Integrating AI/ML models with Python, REST APIs and databases.',
      'Supporting evaluation, deployment and troubleshooting of AI/ML applications.',
    ],
    stack: ['Generative AI', 'NLP', 'Computer Vision', 'Python', 'REST APIs', 'Databases'],
  },
  {
    id: 'research-intern',
    title: 'Machine Learning Research Intern',
    org: 'IIT Bhilai',
    kind: 'Internship',
    start: 'Feb 2025',
    end: 'Jun 2025',
    summary: 'Built an end-to-end legal-domain AI chatbot on curated Indian legal datasets.',
    points: [
      'Built scraping and preprocessing pipelines that turn large volumes of unstructured legal text into structured question–answer datasets (Python, JSON).',
      'Adapted language models for legal question answering with parameter-efficient fine-tuning.',
      'Kept training efficient and reliable with checkpointing and memory-aware optimization.',
      'Shipped a Streamlit app serving real-time legal queries, so the model could be evaluated on real questions.',
    ],
    stack: ['PEFT', 'LLMs', 'Python', 'Streamlit', 'Data pipelines'],
    credential: 'https://drive.google.com/file/d/1C_H2RyO1_O7bIHKzo8zxGJ9AgZPaiSkL/view?usp=sharing',
  },
  {
    id: 'encryptix',
    title: 'Data Science Intern',
    org: 'Encryptix',
    kind: 'Internship',
    start: 'May 2024',
    end: 'Jun 2024',
    summary: 'Data cleaning, EDA and baseline modelling to support business analysis.',
    points: [
      'Performed data cleaning, preprocessing and EDA with Python and Pandas.',
      'Helped build and evaluate baseline models to analyse trends and patterns.',
      'Created visual reports with Matplotlib and Seaborn for non-technical stakeholders.',
      'Documented findings to support data-driven decisions and process improvements.',
    ],
    stack: ['Pandas', 'EDA', 'Baseline models', 'Matplotlib', 'Seaborn'],
    credential: 'https://drive.google.com/file/d/1ZHI802-bXh1b-dv_4Umij8-UGkcDIHcu/view?usp=sharing',
  },
  {
    id: 'btech',
    title: 'B.Tech, Data Science & Artificial Intelligence',
    org: 'Indian Institute of Technology Bhilai',
    kind: 'Education',
    start: 'Oct 2022',
    end: 'May 2026',
    summary: 'Coursework and projects across machine learning, deep learning, NLP and computer vision.',
    points: [],
    stack: [],
  },
];

export interface Capability {
  name: string;
  build: string;
  stack: string[];
  evidence: { label: string; href: string }[];
  /** Evidence matrix: ids of projects / roles where this capability was actually used. */
  uses: string[];
}

/** Columns of the capability evidence matrix. */
export const evidenceColumns = [
  { id: 'dpr', label: 'DPR', href: '#dpr', group: 'Projects' },
  { id: 'math-agent', label: 'Math agent', href: '#math-agent', group: 'Projects' },
  { id: 'meeting-agent', label: 'Meeting', href: '#meeting-agent', group: 'Projects' },
  { id: 'invoice', label: 'Invoice', href: '#invoice', group: 'Projects' },
  { id: 'attendance', label: 'OMR', href: '#attendance', group: 'Projects' },
  { id: 'exp-rnd', label: 'R&D', href: '#exp-rnd', group: 'Roles' },
  { id: 'exp-research-intern', label: 'Research', href: '#exp-research-intern', group: 'Roles' },
  { id: 'exp-encryptix', label: 'Encryptix', href: '#exp-encryptix', group: 'Roles' },
] as const;

export const capabilities: Capability[] = [
  {
    name: 'Retrieval / RAG',
    uses: ['dpr', 'math-agent', 'meeting-agent'],
    build: 'Dense retrievers, hard-negative mining and vector search that ground LLM answers in real data.',
    stack: ['FAISS', 'Qdrant', 'Chroma', 'sentence-transformers', 'BM25'],
    evidence: [
      { label: 'Multilingual DPR', href: '#dpr' },
      { label: 'Meeting Intelligence', href: '#meeting-agent' },
    ],
  },
  {
    name: 'LLMs',
    uses: ['dpr', 'math-agent', 'meeting-agent', 'invoice', 'exp-research-intern'],
    build: 'Fine-tuned and locally served language models for domain QA, classification and generation.',
    stack: ['Hugging Face', 'PEFT', 'Ollama', 'Llama 3.1', 'Groq', 'Gemini'],
    evidence: [
      { label: 'Legal QA chatbot', href: '#exp-research-intern' },
      { label: 'Multilingual DPR', href: '#dpr' },
    ],
  },
  {
    name: 'Generative AI & Agents',
    uses: ['math-agent', 'meeting-agent', 'invoice', 'exp-rnd'],
    build: 'Agent graphs with routing, tool use, guardrails and human feedback loops.',
    stack: ['LangGraph', 'LangChain', 'Tavily', 'FastAPI'],
    evidence: [{ label: 'Math Routing Agent', href: '#math-agent' }],
  },
  {
    name: 'NLP',
    uses: ['dpr', 'meeting-agent', 'exp-rnd', 'exp-research-intern'],
    build: 'Multilingual retrieval, legal-domain QA datasets, summarisation and action-item extraction.',
    stack: ['Transformers', 'mBERT', 'IndicTrans2', 'sentence-transformers'],
    evidence: [
      { label: 'Multilingual DPR', href: '#dpr' },
      { label: 'Meeting Intelligence', href: '#meeting-agent' },
    ],
  },
  {
    name: 'Computer Vision',
    uses: ['invoice', 'attendance', 'exp-rnd'],
    build: 'Document understanding: from deterministic OpenCV pipelines to vision-language extraction.',
    stack: ['OpenCV', 'Tesseract', 'LLaMA 3.2 Vision', 'ViT'],
    evidence: [
      { label: 'Invoice Extraction', href: '#invoice' },
      { label: 'Attendance OMR', href: '#attendance' },
    ],
  },
  {
    name: 'Deep Learning',
    uses: ['dpr', 'exp-research-intern'],
    build: 'Dual-encoder training with contrastive objectives, mixed precision and memory-aware training.',
    stack: ['PyTorch', 'TensorFlow', 'CUDA', 'FP16'],
    evidence: [{ label: 'Multilingual DPR', href: '#dpr' }],
  },
  {
    name: 'Machine Learning',
    uses: ['dpr', 'exp-encryptix'],
    build: 'Feature engineering, supervised models and exploratory analysis that frame the problem first.',
    stack: ['scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
    evidence: [{ label: 'Encryptix internship', href: '#exp-encryptix' }],
  },
  {
    name: 'Backend / APIs',
    uses: ['math-agent', 'meeting-agent', 'attendance', 'exp-rnd'],
    build: 'Typed model-serving APIs with validation, health checks and clear failure modes.',
    stack: ['FastAPI', 'Flask', 'REST', 'Pydantic', 'Go / Gin'],
    evidence: [
      { label: 'Math Routing Agent', href: '#math-agent' },
      { label: 'Attendance OMR', href: '#attendance' },
    ],
  },
  {
    name: 'Databases',
    uses: ['math-agent', 'exp-rnd'],
    build: 'Relational, document and vector stores behind AI applications.',
    stack: ['MySQL', 'MongoDB', 'Qdrant', 'Chroma'],
    evidence: [{ label: 'Restaurant Queue Manager', href: '#more-work' }],
  },
  {
    name: 'Deployment / MLOps',
    uses: ['invoice', 'exp-rnd', 'exp-research-intern'],
    build: 'Containerised services and hosted apps that people can actually open and use.',
    stack: ['Docker', 'Render', 'Streamlit', 'Gunicorn'],
    evidence: [{ label: 'Invoice Extraction (live)', href: '#invoice' }],
  },
];

export const languages = ['Python', 'SQL', 'C++'];
