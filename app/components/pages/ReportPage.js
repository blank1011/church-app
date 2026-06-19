'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatCard from '../StatCard'
import AreaTrend from '../AreaTrend'
import { useSettings } from '../../context/SettingsContext'

const cardClass = 'bg-surface rounded-3xl border border-line p-4'
const sectionLabel = 'text-xs uppercase tracking-wide text-muted mb-3'

export default function ReportPage() {
  const { allocations } = useSettings()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [month, year])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/report?month=${month}&year=${year}`)
      const data = await res.json()
      setReport(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function formatService(s) {
    const d = new Date(s.date)
    const label = s.serviceType === 'Sunday AM' ? 'Sunday AM'
      : s.serviceType === 'Sunday PM' ? 'Sunday PM' : 'Wednesday PM'
    return { label, date: d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) }
  }

  const monthName = new Date(year, month - 1, 1)
    .toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  const trend = (report?.services || []).map(s => ({
    label: new Date(s.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    value: s.total,
  }))

  const alloc = allocations || {}

  return (
    <div className="space-y-4">

      {/* Month Selector */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth}
            className="w-9 h-9 rounded-xl border border-line bg-surface-2 text-content-soft hover:bg-surface-3 transition-colors flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
          <p className="flex-1 text-center text-sm font-semibold text-content">{monthName}</p>
          <button onClick={nextMonth}
            className="w-9 h-9 rounded-xl border border-line bg-surface-2 text-content-soft hover:bg-surface-3 transition-colors flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted">Loading report...</div>
      ) : !report || report.tithesOffering === 0 ? (
        <div className={`${cardClass} py-16 text-center`}>
          <p className="text-sm text-muted">No data recorded for {monthName}.</p>
        </div>
      ) : (
        <>
          {/* Hero total + trend chart */}
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'var(--accent-soft)' }}
            />
            <div className="relative">
              <p className="text-xs text-muted">Tithes &amp; Offering · {monthName}</p>
              <p className="mt-1 text-3xl font-bold text-content tracking-tight">
                ₱{report.tithesOffering.toLocaleString()}
              </p>
              <div className="mt-3 -mx-1">
                {trend.length > 0 && (
                  <AreaTrend data={trend} height={80} showAxes gradientId="reportFill" />
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard label="Services" value={report.serviceCount} sub="This month" />
            <StatCard label="Givers" value={report.uniqueGivers} sub="Unique" />
            <StatCard label="Total" value={`₱${report.tithesOffering.toLocaleString()}`} sub="Base" accent />
          </div>

          {/* Allocations — dynamic from settings */}
          <div className={cardClass}>
            <p className={sectionLabel}>Allocations this month</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(alloc).map(([key, percent]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                const base = report.tithesOffering * (percent / 100)
                const specific = (report.specificByType?.[key] || 0)
                const total = base + specific
                return (
                  <div key={key} className="bg-surface-2 rounded-2xl p-3.5 border-l-4 border-accent">
                    <p className="text-xs text-muted">{label} ({percent}%)</p>
                    <p className="text-sm font-semibold text-content mt-1">₱{base.toLocaleString()}</p>
                    {specific > 0 && (
                      <p className="text-xs text-accent mt-0.5">+ ₱{specific.toLocaleString()} specific</p>
                    )}
                    <p className="text-xs font-semibold text-accent mt-1.5 pt-1.5 border-t border-line">
                      Total: ₱{total.toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Services this month */}
          <div className={cardClass}>
            <p className={sectionLabel}>Services this month</p>
            <div className="space-y-2">
              {report.services.map((s, i) => {
                const { label, date } = formatService(s)
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-2xl">
                    <div>
                      <p className="text-sm text-content">{label}</p>
                      <p className="text-xs text-muted mt-0.5">{date} · {s.entryCount} entries</p>
                    </div>
                    <p className="text-sm font-semibold text-content">₱{s.total.toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

    </div>
  )
}