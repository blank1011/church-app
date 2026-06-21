'use client'
import { useState, useEffect } from 'react'
import { PenLine, BarChart2, ArrowUpRight, TrendingUp, RefreshCw } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { useChurch } from '../../context/ChurchContext'
import { useCache } from '../../context/CacheContext'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import EmptyState from '../EmptyState'
import AreaTrend from '../AreaTrend'
import Badge from '../Badge'

export default function HomePage({ setActivePage }) {
  const { allocations, churchName } = useSettings()
  const { churchFetch } = useChurch()
  const { getCache, setCache, clearCacheByKey } = useCache()
  const [report, setReport] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthName = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  
  const reportCacheKey = `report-${month}-${year}`
  const historyCacheKey = 'history-recent'

  async function loadData(skipCache = false) {
    try {
      let rData = null
      let hData = null

      // Check cache first
      if (!skipCache) {
        const cachedReport = getCache(reportCacheKey)
        const cachedHistory = getCache(historyCacheKey)
        
        if (cachedReport) rData = cachedReport
        if (cachedHistory) hData = cachedHistory
      }

      // Fetch missing data
      const promises = []
      if (!rData) {
        promises.push(
          churchFetch(`/api/report?month=${month}&year=${year}`)
            .then(res => res.json())
            .then(data => { rData = data; return data })
        )
      }
      if (!hData) {
        promises.push(
          churchFetch('/api/history?search=')
            .then(res => res.json())
            .then(data => { hData = data; return data })
        )
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }

      // Cache the results
      if (rData && !getCache(reportCacheKey)) {
        setCache(reportCacheKey, rData)
      }
      if (hData && !getCache(historyCacheKey)) {
        setCache(historyCacheKey, hData)
      }

      setReport(rData)
      setRecent(Array.isArray(hData) ? hData.slice(0, 5) : [])
      setError('')
    } catch (err) {
      console.error(err)
      setError('Unable to load church records. Please refresh the page.')
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      await loadData()
      setLoading(false)
    }
    load()
  }, [month, year, churchFetch])

  const { isRefreshing, pullDistance } = usePullToRefresh(async () => {
    clearCacheByKey(reportCacheKey)
    clearCacheByKey(historyCacheKey)
    await loadData(true)
  })

  const tithesOffering = report?.tithesOffering || 0
  const alloc = allocations || {}

  // Trend from this month's services
  const trend = (report?.services || []).map(s => ({
    label: new Date(s.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    value: s.total,
  }))

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-4" data-pull-refresh-container>
      {/* Pull-to-Refresh Indicator */}
      {pullDistance > 0 && (
        <div className="sticky top-0 z-40 flex items-center justify-center overflow-hidden rounded-b-2xl bg-gradient-to-b from-cyan-500/20 to-transparent p-3 backdrop-blur-sm">
          <RefreshCw 
            size={20} 
            className={`text-cyan-400 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              opacity: Math.min(pullDistance / 100, 1),
              transform: `rotate(${Math.min(pullDistance * 3.6, 360)}deg)`,
            }}
          />
          <span className="ml-2 text-xs font-medium text-cyan-300">
            {pullDistance > 60 ? 'Release to refresh' : 'Pull down to refresh'}
          </span>
        </div>
      )}

      {/* ===== Balance hero ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ background: 'var(--accent-soft)' }}
        />
        <div className="relative">
          <p className="text-xs text-muted">Tithes &amp; Offering · {monthName}</p>
          <div className="mt-1 flex items-end gap-3">
            <p className="text-3xl font-bold text-content tracking-tight">
              ₱{tithesOffering.toLocaleString()}
            </p>
            <span className="mb-1 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium text-positive"
              style={{ backgroundColor: 'var(--positive-soft)' }}>
              <TrendingUp size={12} />
              {report?.serviceCount || 0} services
            </span>
          </div>

          {/* sparkline */}
          <div className="mt-3 -mx-1">
            {trend.length > 0 ? (
              <AreaTrend data={trend} height={90} showAxes={false} gradientId="heroFill" />
            ) : (
              <div className="h-[90px] flex items-center justify-center text-xs text-muted">
                No services recorded this month yet.
              </div>
            )}
          </div>

          {/* quick actions */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActivePage('record')}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-contrast hover:bg-accent-strong transition-colors">
              <PenLine size={16} /> Record
            </button>
            <button
              onClick={() => setActivePage('report')}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 py-2.5 text-sm font-semibold text-content hover:bg-surface-3 transition-colors">
              <BarChart2 size={16} /> Report
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-danger-soft bg-danger-soft/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* ===== Allocation cards ===== */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted">Allocations</p>
          <button onClick={() => setActivePage('settings')} className="text-xs text-accent hover:underline">
            Manage
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.keys(alloc).length === 0 ? (
            <p className="col-span-2 text-sm text-muted">No allocations configured.</p>
          ) : (
            Object.entries(alloc).map(([key, percent]) => {
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              const amount = tithesOffering * (percent / 100)
              return (
                <div key={key} className="rounded-2xl border border-line bg-surface p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted truncate pr-1">{label}</p>
                    <span className="text-[10px] font-medium text-accent shrink-0">{percent}%</span>
                  </div>
                  <p className="mt-1.5 text-base font-semibold text-content">
                    ₱{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ===== Recent givings ===== */}
      <div className="rounded-3xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted">Recent Givings</p>
          <button onClick={() => setActivePage('history')}
            className="flex items-center gap-0.5 text-xs text-accent hover:underline">
            View all <ArrowUpRight size={12} />
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted">Loading…</p>
        ) : recent.length === 0 ? (
          <EmptyState type="givings" />
        ) : (
          <div className="space-y-1">
            {recent.map((g, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-accent"
                  style={{ backgroundColor: 'var(--accent-soft)' }}>
                  {g.giverName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-content">{g.giverName}</p>
                  <p className="text-xs text-muted">{formatDate(g.createdAt)}</p>
                </div>
                <Badge type={g.givingType} />
                <p className="w-20 text-right text-sm font-medium text-content">
                  ₱{g.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
