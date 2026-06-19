'use client'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Badge from '../Badge'
import ConfirmModal from '../ConfirmModal'

const cardClass = 'bg-surface rounded-3xl border border-line p-4'
const sectionLabel = 'text-xs uppercase tracking-wide text-muted mb-3'

export default function HistoryPage() {
  const [givings, setGivings] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null })

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory(searchTerm = '') {
    setLoading(true)
    try {
      const res = await fetch(`/api/history?search=${searchTerm}`)
      const data = await res.json()
      setGivings(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function handleSearch(value) {
    setSearch(value)
    fetchHistory(value)
  }

  function confirmDelete(id, name) {
    setModal({
      open: true,
      title: 'Delete Giving',
      message: `Delete this giving record for "${name}"? This will affect monthly computations.`,
      onConfirm: async () => {
        setModal({ open: false })
        await fetch(`/api/givings?id=${id}`, { method: 'DELETE' })
        // Smooth remove from UI instantly
        setGivings(prev => prev.filter(g => g._id !== id))
      }
    })
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatService(service) {
    if (!service) return '—'
    const label = service.serviceType === 'Sunday AM' ? 'Sun AM'
      : service.serviceType === 'Sunday PM' ? 'Sun PM' : 'Wed PM'
    const d = new Date(service.date)
    return `${label} · ${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
  }

  const total = givings.reduce((sum, g) => sum + g.amount, 0)

  return (
    <div className="space-y-4">

      <ConfirmModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ open: false })}
      />

      {/* Search */}
      <div className={cardClass}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by giver name..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface-2 pl-9 pr-3 py-2.5 text-sm text-content placeholder-muted outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Results */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <p className={sectionLabel}>
            {search ? `Results for "${search}"` : 'All givings'}
          </p>
          <p className="text-xs text-muted">{givings.length} records</p>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Loading...</p>
        ) : givings.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            {search ? `No records found for "${search}"` : 'No givings recorded yet.'}
          </p>
        ) : (
          <>
            <div className="space-y-1">
              {givings.map((g, i) => (
                <div key={g._id || i}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-surface-2 transition-colors group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-accent"
                    style={{ backgroundColor: 'var(--accent-soft)' }}>
                    {g.giverName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-content">{g.giverName}</p>
                    <p className="text-xs text-muted">
                      {formatDate(g.createdAt)}
                      {g.service && <span className="ml-1">· {formatService(g.service)}</span>}
                    </p>
                  </div>
                  <Badge type={g.givingType} />
                  <p className="w-20 text-right text-sm font-medium text-content shrink-0">
                    ₱{g.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => confirmDelete(g._id, g.giverName)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger p-1 rounded-lg hover:bg-danger-soft shrink-0">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3 pt-3 border-t border-line text-sm text-muted">
              Total: <span className="font-semibold text-accent ml-1">₱{total.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

    </div>
  )
}