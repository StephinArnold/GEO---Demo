import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, Circle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = [
  'Fetching webpage',
  'Extracting content',
  'Analysing structure',
  'Detecting schema',
  'Running ML model',
  'Generating SHAP explanation',
  'Building recommendations',
]

export default function AnalyzePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [url, setUrl] = useState(location.state?.url || '')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [doneSteps, setDoneSteps] = useState([])
  const [error, setError] = useState(null)

  // Auto-start if URL was passed from homepage
  useEffect(() => {
    if (location.state?.url) handleAnalyze(location.state.url)
  }, [])

  const handleAnalyze = async (inputUrl) => {
    const target = (inputUrl || url).trim()
    if (!target) { toast.error('Please enter a URL'); return }
    if (!target.startsWith('http')) { toast.error('URL must start with http:// or https://'); return }

    setLoading(true)
    setError(null)
    setDoneSteps([])
    setCurrentStep(0)

    // Simulate step progress (visual)
    const stepTimings = [400, 600, 600, 500, 800, 700, 400]
    let elapsed = 0
    stepTimings.forEach((delay, i) => {
      elapsed += delay
      setTimeout(() => {
        setCurrentStep(i + 1)
        setDoneSteps(prev => [...prev, i])
      }, elapsed)
    })

    try {
      const res = await axios.post('/api/analyze', { url: target }, { timeout: 60000 })
      setLoading(false)
      setCurrentStep(-1)
      toast.success('Analysis complete!')
      navigate('/dashboard', { state: { result: res.data } })
    } catch (err) {
      setLoading(false)
      setCurrentStep(-1)
      const msg = err.response?.data?.detail || err.message || 'Analysis failed. Please try again.'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Analyse Your Webpage</h1>
        <p className="text-[#64748B]">
          Enter any public webpage URL to get a citation likelihood prediction.
        </p>
      </div>

      {/* Input card */}
      <div className="card mb-8">
        <label className="block text-sm font-medium text-[#94A3B8] mb-3">Webpage URL</label>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 rounded-xl border border-[rgba(108,99,255,0.2)] bg-[rgba(255,255,255,0.03)]">
            <Search size={16} className="text-[#6C63FF] shrink-0" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              disabled={loading}
              placeholder="https://example.com/local-business-page"
              className="flex-1 bg-transparent text-white placeholder-[#475569] outline-none py-3 text-sm"
            />
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !url.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Analysing…' : 'Analyze'}
          </button>
        </div>
        <p className="text-[#475569] text-xs mt-3">
          Only publicly accessible http/https URLs are supported. The page must have readable HTML content.
        </p>
      </div>

      {/* Progress steps */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <h3 className="text-sm font-semibold text-[#94A3B8] mb-5 uppercase tracking-wider">
              Analysing…
            </h3>
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done   = doneSteps.includes(i)
                const active = currentStep === i
                return (
                  <div key={step} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle size={18} className="text-[#10B981] shrink-0" />
                    ) : active ? (
                      <Loader2 size={18} className="text-[#6C63FF] shrink-0 animate-spin" />
                    ) : (
                      <Circle size={18} className="text-[#334155] shrink-0" />
                    )}
                    <span className={`text-sm ${done ? 'text-[#10B981]' : active ? 'text-white' : 'text-[#475569]'}`}>
                      {step}
                    </span>
                    {done && <span className="text-[#10B981] text-xs ml-auto">✓</span>}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] mt-4"
        >
          <AlertCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#EF4444] font-medium text-sm mb-1">Analysis Failed</p>
            <p className="text-[#94A3B8] text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Examples */}
      {!loading && (
        <div className="mt-10">
          <p className="text-[#475569] text-xs mb-3 uppercase tracking-wider font-medium">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {[
              'https://en.wikipedia.org/wiki/Coffee',
              'https://schema.org/',
              'https://developers.google.com/',
            ].map(ex => (
              <button
                key={ex}
                onClick={() => { setUrl(ex); handleAnalyze(ex) }}
                className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(108,99,255,0.2)] text-[#6C63FF] hover:bg-[rgba(108,99,255,0.1)] transition-colors"
              >
                {ex.replace('https://', '')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
