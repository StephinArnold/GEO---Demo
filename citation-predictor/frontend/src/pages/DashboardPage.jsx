import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarRadiusAxis, Radar,
} from 'recharts'
import {
  Download, ExternalLink, CheckCircle, XCircle,
  AlertTriangle, Info, Lightbulb, ArrowRight, Shield,
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ─── helpers ────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 61) return '#10B981'
  if (score >= 31) return '#F59E0B'
  return '#EF4444'
}
function predictionClass(score) {
  if (score >= 61) return 'pill-green'
  if (score >= 31) return 'pill-yellow'
  return 'pill-red'
}

function FeatureRow({ label, value, type = 'text' }) {
  const display =
    type === 'bool'
      ? value ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />
      : type === 'pct'
      ? `${Math.round(value * 100)}%`
      : type === 'float'
      ? typeof value === 'number' ? value.toFixed(3) : value
      : String(value ?? '—')

  return (
    <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <span className="text-[#94A3B8] text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{display}</span>
    </div>
  )
}

function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ── Citation Gauge ───────────────────────────────────────────
function CitationGauge({ score }) {
  const colour = scoreColor(score)
  const data = [{ value: score, fill: colour }]
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <RadialBarChart
          width={192} height={192}
          cx={96} cy={96}
          innerRadius={60} outerRadius={88}
          startAngle={225} endAngle={-45}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={8} />
        </RadialBarChart>
        {/* centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: colour }}>{score}</span>
          <span className="text-[#64748B] text-xs mt-1">/ 100</span>
        </div>
      </div>
      <p className="text-[#64748B] text-xs mt-2">Citation Likelihood</p>
    </div>
  )
}

// ── SHAP Bar Chart ───────────────────────────────────────────
function ShapChart({ topPositive, topNegative }) {
  const items = [
    ...(topPositive || []).slice(0, 5).map(x => ({
      name: x.feature.replace(/_/g, ' '),
      value: x.shap_value,
      fill: '#10B981',
    })),
    ...(topNegative || []).slice(0, 5).map(x => ({
      name: x.feature.replace(/_/g, ' '),
      value: x.shap_value,
      fill: '#EF4444',
    })),
  ].sort((a, b) => b.value - a.value)

  if (!items.length) return <p className="text-[#475569] text-sm">SHAP data unavailable</p>

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={items} layout="vertical" margin={{ left: 16, right: 16 }}>
        <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} width={150} />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8 }}
          labelStyle={{ color: '#F1F5F9' }}
          formatter={val => [val.toFixed(4), 'SHAP value']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {items.map((entry, index) => (
            <Cell key={index} fill={entry.fill} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Structural Radar ─────────────────────────────────────────
function StructuralRadar({ derived }) {
  const data = [
    { subject: 'Macro', value: Math.round((derived?.macro_score || 0) * 100) },
    { subject: 'Meso',  value: Math.round((derived?.meso_score  || 0) * 100) },
    { subject: 'Micro', value: Math.round((derived?.micro_score || 0) * 100) },
    { subject: 'Format', value: Math.round((derived?.format_diversity || 0) * 100) },
    { subject: 'Factual', value: Math.round(Math.min((derived?.factual_density || 0) * 500, 100)) },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── Local Business Readiness ─────────────────────────────────
function LocalBizReadiness({ lb, schema }) {
  const checks = [
    { label: 'Business Name',      ok: !!lb?.business_name },
    { label: 'Phone Number',       ok: !!lb?.has_phone },
    { label: 'Street Address',     ok: !!lb?.has_address },
    { label: 'Opening Hours',      ok: !!lb?.has_opening_hours },
    { label: 'Rating / Reviews',   ok: !!lb?.has_rating },
    { label: 'LocalBusiness Schema', ok: !!schema?.local_business_schema },
    { label: 'FAQ Schema',         ok: !!schema?.faq_schema },
    { label: 'Review Schema',      ok: !!schema?.review_schema },
  ]
  const total = checks.filter(c => c.ok).length
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[#64748B]">Readiness</span>
        <span className="font-bold text-white">{total}/{checks.length}</span>
      </div>
      <div className="space-y-2">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-[#94A3B8]">{label}</span>
            {ok
              ? <CheckCircle size={16} className="text-[#10B981]" />
              : <XCircle    size={16} className="text-[#EF4444]" />
            }
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Recommendation card ──────────────────────────────────────
function RecCard({ rec }) {
  const colour = { high: '#EF4444', medium: '#F59E0B', low: '#6C63FF' }[rec.priority] || '#6C63FF'
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(108,99,255,0.3)] transition-colors">
      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `${colour}20` }}>
        <Lightbulb size={15} style={{ color: colour }} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white text-sm font-semibold">{rec.title}</span>
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${colour}20`, color: colour }}>
            {rec.priority}
          </span>
          <span className="text-[#475569] text-xs">{rec.category}</span>
        </div>
        <p className="text-[#64748B] text-xs leading-relaxed">{rec.description}</p>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────
export default function DashboardPage() {
  const location = useLocation()
  const { historyId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!result && historyId) {
      setLoading(true)
      axios.get(`/api/history/${historyId}`)
        .then(r => {
          setResult({
            url: r.data.url,
            timestamp: r.data.timestamp,
            citation_score: Math.round(r.data.score * 100),
            citation_probability: r.data.score,
            prediction: r.data.prediction,
            features: r.data.features,
            shap_data: r.data.shap_values,
            recommendations: r.data.recommendations,
          })
        })
        .catch(() => toast.error('Could not load history record.'))
        .finally(() => setLoading(false))
    }
  }, [historyId])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!result) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <AlertTriangle size={48} className="text-[#F59E0B] mx-auto mb-5" />
      <h2 className="text-xl font-bold text-white mb-3">No analysis loaded</h2>
      <p className="text-[#64748B] mb-6">Please run an analysis first.</p>
      <button onClick={() => navigate('/analyze')} className="btn-primary">Go to Analyze</button>
    </div>
  )

  const score        = result.citation_score ?? Math.round((result.citation_probability || 0) * 100)
  const features     = result.features || {}
  const mf           = features.model_features || {}
  const content      = features.content       || {}
  const structure    = features.structure     || {}
  const schema       = features.schema        || {}
  const lb           = features.local_business || {}
  const derived      = features.derived       || {}
  const shap         = result.shap_data       || {}
  const recs         = result.recommendations || []

  const handleDownload = async () => {
    try {
      const res = await axios.post('/api/report', { analysis: result }, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href    = url
      a.download = 'citelytics_report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not generate PDF report.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Webpage Citation Analysis</h1>
          <div className="flex items-center gap-2 text-[#64748B] text-sm">
            <ExternalLink size={13} />
            <span className="truncate max-w-md">{result.url}</span>
          </div>
          <p className="text-[#475569] text-xs mt-1">{result.timestamp ? new Date(result.timestamp).toLocaleString() : ''}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => navigate('/analyze')}>
            <ArrowRight size={14} /> New Analysis
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={handleDownload}>
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.07)] mb-6">
        <Shield size={16} className="text-[#F59E0B] shrink-0" />
        <p className="text-[#F59E0B] text-xs">
          <strong>Demo model / Research prototype</strong> — Trained on synthetic data.
          The score estimates citation likelihood based on extracted features and is NOT a guarantee of being cited by any AI system.
        </p>
      </div>

      {/* Score cards row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: 'Citation Likelihood',
            value: `${score}/100`,
            sub: result.prediction,
            colour: scoreColor(score),
          },
          {
            label: 'Factual Density',
            value: `${Math.round((derived.factual_density || 0) * 100)}%`,
            sub: 'Estimated (heuristic)',
            colour: '#6C63FF',
          },
          {
            label: 'Format Diversity',
            value: `${Math.round((derived.format_diversity || 0) * 100)}%`,
            sub: 'Content variety score',
            colour: '#A855F7',
          },
          {
            label: 'Schema Score',
            value: schema.schema_present ? 'Present' : 'Missing',
            sub: `${schema.number_of_schema_types || 0} type(s) detected`,
            colour: schema.schema_present ? '#10B981' : '#EF4444',
          },
        ].map(card => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <p className="text-[#64748B] text-xs uppercase tracking-wider mb-2">{card.label}</p>
            <p className="text-3xl font-bold mb-1" style={{ color: card.colour }}>{card.value}</p>
            <p className="text-[#475569] text-xs">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Row: Gauge + SHAP */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Citation Likelihood Score">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <CitationGauge score={score} />
            <div className="flex-1">
              <div className={`pill ${predictionClass(score)} text-sm mb-4`}>
                {result.prediction}
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { range: '0–30', label: 'Low estimated likelihood',       active: score <= 30 },
                  { range: '31–60', label: 'Moderate estimated likelihood',  active: score >= 31 && score <= 60 },
                  { range: '61–80', label: 'High estimated likelihood',      active: score >= 61 && score <= 80 },
                  { range: '81–100', label: 'Very high estimated likelihood', active: score >= 81 },
                ].map(({ range, label, active }) => (
                  <div key={range} className={`flex gap-2 ${active ? 'text-white' : 'text-[#475569]'}`}>
                    <span className="font-mono text-xs w-16">{range}</span>
                    <span className="text-xs">{label}</span>
                    {active && <span className="text-[#6C63FF] text-xs ml-auto">◀</span>}
                  </div>
                ))}
              </div>
              <p className="text-[#334155] text-xs mt-4">
                Thresholds are interface categories, not scientifically established boundaries.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="SHAP Feature Importance">
          <ShapChart topPositive={shap.top_positive} topNegative={shap.top_negative} />
          <p className="text-[#334155] text-xs mt-2">
            SHAP values from XGBoost TreeExplainer. Positive = increases citation likelihood; negative = decreases it.
          </p>
        </SectionCard>
      </div>

      {/* Row: Top factors + Structural radar */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Top Factors">
          <div className="space-y-3 mb-5">
            <p className="text-[#10B981] text-xs font-semibold uppercase tracking-wider">▲ Positive</p>
            {(shap.top_positive || []).slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-[#10B981] font-mono w-14 shrink-0">+{item.shap_value.toFixed(4)}</span>
                <span className="text-[#94A3B8]">{item.feature.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[#EF4444] text-xs font-semibold uppercase tracking-wider">▼ Negative</p>
            {(shap.top_negative || []).slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-[#EF4444] font-mono w-14 shrink-0">{item.shap_value.toFixed(4)}</span>
                <span className="text-[#94A3B8]">{item.feature.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Structural Metrics (Macro / Meso / Micro)">
          <StructuralRadar derived={derived} />
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: 'Macro', value: derived.macro_score },
              { label: 'Meso',  value: derived.meso_score  },
              { label: 'Micro', value: derived.micro_score },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-2 rounded-lg bg-[rgba(108,99,255,0.06)]">
                <p className="text-[#6C63FF] text-lg font-bold">{Math.round((value || 0) * 100)}</p>
                <p className="text-[#64748B] text-xs">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Feature details */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Content Features">
          <FeatureRow label="Word Count"       value={content.word_count} />
          <FeatureRow label="Sentence Count"   value={content.sentence_count} />
          <FeatureRow label="Paragraph Count"  value={content.paragraph_count} />
          <FeatureRow label="Avg Sentence Len" value={content.avg_sentence_length} type="float" />
          <FeatureRow label="Avg Para Len"     value={content.avg_paragraph_length} type="float" />
          <FeatureRow label="External Links"   value={content.external_link_count} />
          <FeatureRow label="Internal Links"   value={content.internal_link_count} />
          <FeatureRow label="Images"           value={content.image_count} />
          <FeatureRow label="Lists"            value={content.list_count} />
          <FeatureRow label="Tables"           value={content.table_count} />
          <FeatureRow label="Emphasis"         value={content.emphasis_count} />
          <FeatureRow label="Numbers"          value={content.number_count} />
          <FeatureRow label="Percentages"      value={content.percentage_count} />
          <FeatureRow label="Dates"            value={content.date_count} />
          <FeatureRow label="Quotes"           value={content.quote_count} />
          <FeatureRow label="Citation Refs"    value={content.citation_ref_count} />
        </SectionCard>

        <SectionCard title="Structure Features">
          <FeatureRow label="H1 Tags"            value={structure.h1_count} />
          <FeatureRow label="H2 Tags"            value={structure.h2_count} />
          <FeatureRow label="H3 Tags"            value={structure.h3_count} />
          <FeatureRow label="Heading Count"      value={structure.heading_count} />
          <FeatureRow label="Heading Depth"      value={structure.heading_depth} />
          <FeatureRow label="Hierarchy Score"    value={structure.heading_hierarchy_score} type="float" />
          <FeatureRow label="Section Count"      value={structure.section_count} />
          <FeatureRow label="Paras / Section"    value={structure.avg_paragraphs_per_section} type="float" />
          <FeatureRow label="Factual Density*"   value={derived.factual_density} type="float" />
          <FeatureRow label="Format Diversity"   value={derived.format_diversity} type="float" />
          <FeatureRow label="Emphasis Density"   value={derived.emphasis_density} type="float" />
          <FeatureRow label="Macro Score"        value={derived.macro_score} type="float" />
          <FeatureRow label="Meso Score"         value={derived.meso_score}  type="float" />
          <FeatureRow label="Micro Score"        value={derived.micro_score} type="float" />
        </SectionCard>

        <SectionCard title="Schema & Local Business">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-3">Schema</p>
          <FeatureRow label="Schema Present"        value={schema.schema_present}        type="bool" />
          <FeatureRow label="LocalBusiness Schema"  value={schema.local_business_schema} type="bool" />
          <FeatureRow label="Organization Schema"   value={schema.organization_schema}   type="bool" />
          <FeatureRow label="FAQ Schema"            value={schema.faq_schema}            type="bool" />
          <FeatureRow label="Article Schema"        value={schema.article_schema}        type="bool" />
          <FeatureRow label="Review Schema"         value={schema.review_schema}         type="bool" />
          <FeatureRow label="Breadcrumb Schema"     value={schema.breadcrumb_schema}     type="bool" />
          <FeatureRow label="# Schema Types"        value={schema.number_of_schema_types} />
          {(schema.schema_types_detected || []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {schema.schema_types_detected.map(t => (
                <span key={t} className="pill pill-purple text-[10px]">{t}</span>
              ))}
            </div>
          )}
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-3 mt-5">Local Business</p>
          <LocalBizReadiness lb={lb} schema={schema} />
          {lb.business_name && (
            <p className="text-[#94A3B8] text-xs mt-3">Name: <strong>{lb.business_name}</strong></p>
          )}
          {(lb.detected_phones || []).length > 0 && (
            <p className="text-[#94A3B8] text-xs mt-1">Phone: <strong>{lb.detected_phones[0]}</strong></p>
          )}
        </SectionCard>
      </div>

      {/* Recommendations */}
      <SectionCard title={`Recommendations (${recs.length})`} className="mb-6">
        {recs.length === 0 ? (
          <p className="text-[#475569] text-sm">No recommendations generated.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recs.map((rec, i) => <RecCard key={i} rec={rec} />)}
          </div>
        )}
      </SectionCard>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-[rgba(100,116,139,0.2)] bg-[rgba(100,116,139,0.05)]">
        <Info size={16} className="text-[#64748B] shrink-0 mt-0.5" />
        <p className="text-[#475569] text-xs leading-relaxed">
          <strong className="text-[#64748B]">Disclaimer:</strong> The system estimates citation likelihood based on learned
          relationships between webpage features and a synthetic demo dataset. Predictions should be interpreted as estimates,
          not guarantees. The model does not simulate or access any actual AI answer engine. Correlation between features and
          citation is not evidence of causation.
        </p>
      </div>
    </div>
  )
}
