import { useNavigate } from 'react-router-dom'
import { Brain, Zap, Search, ArrowRight, Shield, TrendingUp, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: Brain,
    title: 'Citation Prediction',
    desc: 'XGBoost ML model estimates how likely your webpage is to be cited by generative AI answer engines.',
    color: '#6C63FF',
  },
  {
    icon: Zap,
    title: 'Explainable AI',
    desc: 'SHAP values reveal exactly which webpage features push the prediction up or down — no black box.',
    color: '#A855F7',
  },
  {
    icon: TrendingUp,
    title: 'GEO Insights',
    desc: 'Actionable recommendations to improve your content structure, factual density, and schema markup.',
    color: '#10B981',
  },
]

const researchGap = [
  { label: 'Traditional SEO', desc: 'Optimises search-engine ranking', active: false },
  { label: 'Checklist GEO', desc: 'Heuristic recommendations', active: false },
  { label: 'Structural GEO', desc: 'Studies structural optimisation', active: false },
  { label: 'Citelytics', desc: 'Explainable per-page citation likelihood model', active: true },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')

  const handleAnalyze = () => {
    if (!url.trim()) return
    navigate('/analyze', { state: { url } })
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-[#A855F7]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#10B981]/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(108,99,255,0.3)] bg-[rgba(108,99,255,0.1)] text-[#6C63FF] text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            Research Prototype — Demo Model
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Can AI Answer Engines<br />
            <span className="gradient-text">Cite Your Webpage?</span>
          </h1>

          <p className="text-[#94A3B8] text-lg sm:text-xl max-w-3xl mx-auto mb-12">
            Analyse your webpage's content and structural signals to estimate citation likelihood
            in generative answer engines using explainable machine learning.
          </p>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex gap-3 p-2 rounded-2xl bg-[#0F172A] border border-[rgba(108,99,255,0.3)] glow">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search size={18} className="text-[#6C63FF] shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  placeholder="https://yourbusiness.com/page"
                  className="flex-1 bg-transparent text-white placeholder-[#475569] outline-none text-base"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!url.trim()}
                className="btn-primary flex items-center gap-2"
              >
                Analyze Page <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-[#475569] text-xs mt-3">
              Prediction is an estimate based on the trained model and extracted webpage features.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: '45+', label: 'Features Extracted' },
            { value: 'XGBoost', label: 'ML Model' },
            { value: 'SHAP', label: 'Explainability' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-[#64748B] text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">What Citelytics Does</h2>
          <p className="text-[#64748B] max-w-xl mx-auto">
            A complete ML pipeline from URL input to explainable citation likelihood prediction.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="card group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">Analysis Pipeline</h2>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3">
          {[
            'Webpage URL','Scraping','Feature Extraction',
            'Feature Processing','XGBoost Model',
            'Citation Score','SHAP Explainability','Recommendations',
          ].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl border border-[rgba(108,99,255,0.3)] bg-[rgba(108,99,255,0.08)] text-[#A5B4FC] text-sm font-medium">
                {step}
              </div>
              {i < arr.length - 1 && <span className="text-[#6C63FF]">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Research Gap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">Research Gap Addressed</h2>
          <p className="text-[#64748B]">Prior work and where Citelytics fits.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {researchGap.map(({ label, desc, active }) => (
            <div
              key={label}
              className={`card text-center ${active ? 'border-[#6C63FF] bg-[rgba(108,99,255,0.08)]' : ''}`}
            >
              {active && (
                <div className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3 bg-[#6C63FF] text-white">
                  OUR APPROACH
                </div>
              )}
              <h4 className={`font-semibold mb-2 ${active ? 'text-[#A5B4FC]' : 'text-[#94A3B8]'}`}>{label}</h4>
              <p className="text-[#64748B] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card gradient-border text-center max-w-2xl mx-auto py-14">
          <BookOpen size={40} className="text-[#6C63FF] mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-white mb-3">Ready to analyse your webpage?</h2>
          <p className="text-[#64748B] mb-7 text-sm">
            Paste any public webpage URL and get an AI-driven citation likelihood report in seconds.
          </p>
          <button onClick={() => navigate('/analyze')} className="btn-primary flex items-center gap-2 mx-auto">
            Start Analysis <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}
