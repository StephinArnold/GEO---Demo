import { motion } from 'framer-motion'
import { Brain, Database, Code2, BarChart2, Layers, BookOpen, ExternalLink } from 'lucide-react'

const sections = [
  {
    icon: Brain,
    title: 'Research Problem',
    color: '#6C63FF',
    content: `Traditional SEO tools optimise for search-engine ranking, but modern generative answer engines (ChatGPT-style systems) directly answer queries and cite only a small number of sources. This project addresses the research gap of predicting, at the webpage level, how likely a page is to be cited — and explaining why.`,
  },
  {
    icon: Code2,
    title: 'Technology Stack',
    color: '#A855F7',
    content: `Frontend: React + Vite + Tailwind CSS + Recharts + Framer Motion.\nBackend: Python + FastAPI + BeautifulSoup + lxml.\nML: XGBoost + scikit-learn + SHAP + pandas + numpy.\nDatabase: SQLite (aiosqlite). Reports: ReportLab PDF.`,
  },
  {
    icon: Layers,
    title: 'Feature Extraction',
    color: '#10B981',
    content: `45+ features extracted across three levels:\n• Macro: Overall page organisation (headings, section count, content length).\n• Meso: Section-level structure (paragraphs per section, list/table usage).\n• Micro: Local content quality (sentence length, emphasis density, numerical facts).\nPlus schema detection (JSON-LD / Microdata) and local-business signals.`,
  },
  {
    icon: BarChart2,
    title: 'ML Model',
    color: '#F59E0B',
    content: `XGBoost binary classifier trained on a synthetic demo dataset (500 samples). Labels are assigned by a transparent heuristic rule based on features known to correlate with content quality. The model is evaluated using accuracy, precision, recall, F1, and ROC-AUC.\n\nIMPORTANT: The demo dataset uses synthetic labels. Replace with real citation observations for production research.`,
  },
  {
    icon: Database,
    title: 'SHAP Explainability',
    color: '#EF4444',
    content: `After XGBoost prediction, SHAP TreeExplainer computes per-feature Shapley values for each prediction. The dashboard displays the top positive and negative factors in a horizontal bar chart with actual SHAP values — no fabricated explanations.`,
  },
  {
    icon: BookOpen,
    title: 'Academic Disclaimer',
    color: '#64748B',
    content: `Citelytics is a research prototype, not a commercial product. The citation score is a model-derived estimate, not a guarantee. Correlation between webpage features and citation likelihood is not evidence of causation. The model does not access or simulate any AI answer engine API.`,
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(108,99,255,0.3)] bg-[rgba(108,99,255,0.1)] text-[#6C63FF] text-sm font-medium mb-6">
          <Brain size={14} />
          College Research Project
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Citation Likelihood Prediction<br />
          <span className="gradient-text">in Generative Answer Engines</span>
        </h1>
        <p className="text-[#64748B] max-w-2xl mx-auto">
          An explainable ML approach for local business content — predicting whether a webpage
          will be cited by AI answer engines using XGBoost + SHAP.
        </p>
      </div>

      <div className="space-y-5">
        {sections.map(({ icon: Icon, title, color, content }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <h2 className="font-semibold text-white">{title}</h2>
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed whitespace-pre-line">{content}</p>
          </motion.div>
        ))}
      </div>

      {/* Architecture */}
      <div className="card mt-6">
        <h2 className="font-semibold text-white mb-4">System Architecture</h2>
        <div className="font-mono text-xs text-[#64748B] bg-[rgba(0,0,0,0.3)] p-5 rounded-xl overflow-x-auto whitespace-pre">{`
  User Browser
      │
  React Frontend (Vite)
      │  POST /api/analyze
      ▼
  FastAPI Backend
      │
  ┌───┴────────────────────────────────────┐
  │  Scraper (requests + BeautifulSoup)    │
  │    ↓                                   │
  │  Feature Extractor                     │
  │    ├── Content Features (16 metrics)   │
  │    ├── Structural Features (macro/meso/micro)│
  │    ├── Schema Detection (JSON-LD)      │
  │    └── Local Business Signals         │
  │    ↓                                   │
  │  XGBoost Classifier  →  Probability   │
  │    ↓                                   │
  │  SHAP TreeExplainer  →  Feature Impact │
  │    ↓                                   │
  │  Recommendation Engine                 │
  │    ↓                                   │
  │  SQLite (aiosqlite)  ← History        │
  └────────────────────────────────────────┘
      │
  JSON Response → Dashboard
  PDF Report    → Download
`.trim()}</div>
      </div>

      <div className="card mt-6 text-center">
        <p className="text-[#475569] text-sm">
          Built as a college research project for the study of Generative Engine Optimisation (GEO).
          Demo model trained on synthetic data. All feature extraction logic is fully open and documented.
        </p>
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-[#64748B] text-sm font-medium"> 👤  Stephin Arnold</p>
          <a
            href="https://github.com/stephinarnold"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#6C63FF] text-xs mt-1 hover:underline"
          >
            <ExternalLink size={12} />
            github.com/stephinarnold
          </a>
        </div>
      </div>
    </div>
  )
}
