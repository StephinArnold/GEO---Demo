import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ExternalLink, TrendingUp, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

function scoreClass(score) {
  const pct = Math.round((score || 0) * 100)
  if (pct >= 61) return 'text-[#10B981]'
  if (pct >= 31) return 'text-[#F59E0B]'
  return 'text-[#EF4444]'
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/history')
      .then(r => setHistory(r.data.history || []))
      .catch(() => toast.error('Could not load history.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analysis History</h1>
        <p className="text-[#64748B]">Click any row to reopen the full report.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="card text-center py-16">
          <Clock size={40} className="text-[#334155] mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No analyses yet</h3>
          <p className="text-[#475569] text-sm mb-6">Run your first analysis to see results here.</p>
          <button onClick={() => navigate('/analyze')} className="btn-primary mx-auto">
            Analyse a Webpage
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                <th className="text-left px-5 py-4 text-[#64748B] text-xs font-semibold uppercase tracking-wider">URL</th>
                <th className="text-left px-5 py-4 text-[#64748B] text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-4 text-[#64748B] text-xs font-semibold uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-4 text-[#64748B] text-xs font-semibold uppercase tracking-wider">Prediction</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/dashboard/${row.id}`)}
                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(108,99,255,0.05)] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ExternalLink size={13} className="text-[#475569] shrink-0" />
                      <span className="text-[#94A3B8] text-sm truncate max-w-xs">{row.url}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#475569] text-sm whitespace-nowrap">
                    {row.timestamp ? new Date(row.timestamp).toLocaleDateString() : '—'}
                  </td>
                  <td className={`px-5 py-4 font-bold text-sm ${scoreClass(row.score)}`}>
                    {Math.round((row.score || 0) * 100)}/100
                  </td>
                  <td className="px-5 py-4 text-[#94A3B8] text-sm">{row.prediction}</td>
                  <td className="px-5 py-4">
                    <TrendingUp size={15} className="text-[#334155] hover:text-[#6C63FF] transition-colors" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
