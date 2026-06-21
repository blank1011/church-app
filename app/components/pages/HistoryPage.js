'use client'
import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import Badge from '../Badge'
import ConfirmModal from '../ConfirmModal'
import EmptyState from '../EmptyState'
import { useToast } from '../Toast'
import { useChurch } from '../../context/ChurchContext'
import { haptic } from '../../lib/haptic'
import { SkeletonList } from '../Skeleton'

const cardClass = 'bg-surface rounded-3xl border border-line p-4'
const sectionLabel = 'text-xs uppercase tracking-wide text-muted mb-3'

export default function HistoryPage() {
  const { addToast } = useToast()
  const { churchFetch } = useChurch()
  const [givings, setGivings] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null })
  const [swipeDistance, setSwipeDistance] = useState({})
  const touchStartX = useRef({})
  const touchStartY = useRef({})
  const swipeHapticTriggered = useRef({})

  useEffect(() => {
    fetchHistory()
  }, [churchFetch])

  async function fetchHistory(searchTerm = '') {
    setLoading(true)
    try {
      const res = await churchFetch(`/api/history?search=${searchTerm}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setGivings(data)
        setError('')
      } else {
        setGivings([])
        setError(data?.error || 'Unable to load giving records.')
      }
    } catch (err) {
      console.error(err)
      setGivings([])
      setError('Unable to load giving records. Please refresh the page.')
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
        await churchFetch(`/api/givings?id=${id}`, { method: 'DELETE' })
        setGivings(prev => prev.filter(g => g._id !== id))
        addToast('Giving deleted!')
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

      <div className={cardClass}>
        {error && (
          <div className="mb-4 rounded-2xl border border-danger-soft bg-danger-soft/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <p className={sectionLabel}>
            {search ? `Results for "${search}"` : 'All givings'}
          </p>
          <p className="text-xs text-muted">{givings.length} records</p>
        </div>

        {loading ? <SkeletonList rows={4} /> : givings.length === 0 ? (
          <EmptyState type="givings" />
        ) : (
          <>
            <div className="space-y-1">
              {givings.map((g, i) => {
                const itemId = g._id || i
                const distance = swipeDistance[itemId] || 0

                return (
                  <div
                    key={itemId}
                    onTouchStart={(e) => {
                      touchStartX.current[itemId] = e.touches[0].clientX
                      touchStartY.current[itemId] = e.touches[0].clientY
                      setSwipeDistance(prev => ({ ...prev, [itemId]: 0 }))
                    }}
                    onTouchMove={(e) => {
                      const currentX = e.touches[0].clientX
                      const currentY = e.touches[0].clientY
                      const startX = touchStartX.current[itemId] || currentX
                      const startY = touchStartY.current[itemId] || currentY
                      const diffX = startX - currentX
                      const diffY = Math.abs(startY - currentY)

                      if (Math.abs(diffX) > diffY && diffX > 0) {
                        const newDistance = Math.min(diffX, 100)
                        setSwipeDistance(prev => ({ ...prev, [itemId]: newDistance }))
                        
                        // Trigger haptic when crossing 50px threshold
                        if (newDistance >= 50 && !swipeHapticTriggered.current[itemId]) {
                          haptic.swipe()
                          swipeHapticTriggered.current[itemId] = true
                        } else if (newDistance < 50 && swipeHapticTriggered.current[itemId]) {
                          swipeHapticTriggered.current[itemId] = false
                        }
                      }
                    }}
                    onTouchEnd={async () => {
                      if (distance > 50) {
                        haptic.delete()
                        setSwipeDistance(prev => ({ ...prev, [itemId]: 0 }))
                        confirmDelete(g._id, g.giverName)
                      }
                      setSwipeDistance(prev => ({ ...prev, [itemId]: 0 }))
                      swipeHapticTriggered.current[itemId] = false
                    }}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-surface-2 transition-colors group relative overflow-hidden"
                    style={{
                      transform: `translateX(-${distance}px)`,
                      opacity: 1 - distance / 150,
                    }}>
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger p-1 rounded-lg hover:bg-danger-soft shrink-0 md:block hidden">
                      ✕
                    </button>
                    {distance > 0 && (
                      <div className="absolute right-4 text-danger text-xs font-medium whitespace-nowrap">
                        {distance > 50 ? 'Release' : 'Swipe'}
                      </div>
                    )}
                  </div>
                )
              })}
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