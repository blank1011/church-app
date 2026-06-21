'use client'
import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useSettings } from '../../context/SettingsContext'
import { useChurch } from '../../context/ChurchContext'
import { useToast } from '../Toast'
import { SkeletonStatGrid, SkeletonList } from '../Skeleton'
import Badge from '../Badge'
import ConfirmModal from '../ConfirmModal'
import EmptyState from '../EmptyState'
import { haptic } from '../../lib/haptic'

export default function RecordPage() {
  const { allocations } = useSettings()
  const { churchFetch } = useChurch()
  const { addToast } = useToast()

  const givingTypes = [
    'Tithe',
    'Offering',
    ...Object.keys(allocations || {})
      .map(key => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      .filter(label => !['Pastoral Tithe'].includes(label))
  ]

  const [date, setDate] = useState(new Date())
  const [serviceType, setServiceType] = useState('Sunday AM')
  const [giverName, setGiverName] = useState('')
  const [amount, setAmount] = useState('')
  const [givingType, setGivingType] = useState('Tithe')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [services, setServices] = useState([])
  const [activeServiceId, setActiveServiceId] = useState(null)
  const [entries, setEntries] = useState([])
  const [allGivers, setAllGivers] = useState([])
  const [filteredGivers, setFilteredGivers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null })
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchServices()
    fetchGivers()
  }, [])

  useEffect(() => {
    if (activeServiceId) fetchEntries(activeServiceId)
  }, [activeServiceId])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchServices() {
    setLoading(true)
    try {
      const res = await churchFetch('/api/services')
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
      if (Array.isArray(data) && data.length > 0 && !activeServiceId) {
        setActiveServiceId(data[0]._id)
      }
    } catch (err) {
      setServices([])
    }
    setLoading(false)
  }

  async function fetchEntries(serviceId) {
    try {
      const res = await churchFetch(`/api/givings?serviceId=${serviceId}`)
      const data = await res.json()
      setEntries(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchGivers() {
    try {
      const res = await churchFetch('/api/givers')
      const data = await res.json()
      setAllGivers(data)
    } catch (err) {
      console.error(err)
    }
  }

  function handleGiverInput(value) {
    setGiverName(value)
    if (value.trim() === '') {
      setFilteredGivers([])
      setShowDropdown(false)
      return
    }
    const filtered = allGivers.filter(g =>
      g.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredGivers(filtered)
    setShowDropdown(filtered.length > 0)
  }

  function selectGiver(name) {
    setGiverName(name)
    setShowDropdown(false)
  }

  async function handleSubmit() {
    if (!date || !giverName || !amount) {
      haptic.error()
      addToast('Please fill in all fields!', 'error')
      return
    }
    setSubmitting(true)
    try {
      const serviceRes = await churchFetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date.toISOString(), serviceType })
      })
      const service = await serviceRes.json()

      const givingRes = await churchFetch('/api/givings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service._id,
          giverName: giverName.trim(),
          amount: parseFloat(amount),
          givingType
        })
      })

      if (givingRes.ok) {
        haptic.success()
        addToast('Giving recorded successfully!')
        setGiverName('')
        setAmount('')
        setActiveServiceId(service._id)
        fetchServices()
        fetchEntries(service._id)
        fetchGivers()
      }
    } catch (err) {
      haptic.error()
      addToast('Error saving. Try again.', 'error')
    }
    setSubmitting(false)
  }

  function confirmDeleteService(id) {
    setModal({
      open: true,
      title: 'Delete Service',
      message: 'This will delete the service and all its entries. This cannot be undone.',
      onConfirm: async () => {
        haptic.delete()
        setModal({ open: false })
        await churchFetch(`/api/givings?serviceId=${id}`, { method: 'DELETE' })
        await churchFetch(`/api/services?id=${id}`, { method: 'DELETE' })
        setServices(prev => prev.filter(s => s._id !== id))
        setActiveServiceId(null)
        setEntries([])
        addToast('Service deleted!')
      }
    })
  }

  function confirmDeleteEntry(id) {
    setModal({
      open: true,
      title: 'Delete Entry',
      message: 'This giving record will be permanently deleted.',
      onConfirm: async () => {
        haptic.delete()
        setModal({ open: false })
        await churchFetch(`/api/givings?id=${id}`, { method: 'DELETE' })
        setEntries(prev => prev.filter(e => e._id !== id))
        addToast('Entry deleted!')
      }
    })
  }

  function formatService(s) {
    const d = new Date(s.date)
    if (isNaN(d.getTime())) return s.serviceType
    const label = s.serviceType === 'Sunday AM' ? 'Sun AM'
      : s.serviceType === 'Sunday PM' ? 'Sun PM' : 'Wed PM'
    return `${label} · ${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
  }

  const serviceTotal = entries.reduce((sum, e) => sum + e.amount, 0)
  const tithesOffering = entries
    .filter(e => e.givingType === 'Tithe' || e.givingType === 'Offering')
    .reduce((sum, e) => sum + e.amount, 0)
  const alloc = allocations || {}

  const inputClass = 'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-content placeholder-muted outline-none focus:border-accent transition-colors'

  return (
    <div className="space-y-4">
      <ConfirmModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ open: false })}
      />

      {loading ? <SkeletonStatGrid /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Service total', value: `₱${serviceTotal.toLocaleString()}`, sub: 'All giving types' },
            { label: 'Services', value: services.length, sub: 'Total recorded' },
            { label: 'Entries', value: entries.length, sub: 'This service' },
            { label: 'Tithes + Offering', value: `₱${tithesOffering.toLocaleString()}`, sub: 'This service' },
          ].map((s, i) => (
            <div key={i} className="bg-surface rounded-3xl border border-line p-3">
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className="text-base font-semibold text-content">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface rounded-3xl border border-line p-4">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">New Entry</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Date</label>
            <DatePicker
              selected={date}
              onChange={d => setDate(d)}
              dateFormat="MMMM d, yyyy"
              className={inputClass}
              calendarClassName="rounded-xl shadow-lg"
              showPopperArrow={false}
              todayButton="Today"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Service</label>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={inputClass}>
              <option>Sunday AM</option>
              <option>Sunday PM</option>
              <option>Wednesday PM</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="relative" ref={dropdownRef}>
            <label className="text-xs text-muted mb-1 block">Giver Name</label>
            <input
              type="text"
              placeholder="Type to search or add new"
              value={giverName}
              onChange={e => handleGiverInput(e.target.value)}
              onFocus={() => giverName && setShowDropdown(filteredGivers.length > 0)}
              className={inputClass} />
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-surface border border-line rounded-2xl shadow-xl max-h-40 overflow-y-auto">
                {filteredGivers.map((g, i) => (
                  <button key={i} onClick={() => selectGiver(g)}
                    className="w-full text-left px-3 py-2.5 text-sm text-content hover:bg-surface-2 border-b border-line last:border-0 transition-colors">
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Amount (₱)</label>
            <input type="number" placeholder="0.00" value={amount}
              onChange={e => setAmount(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-muted mb-1 block">Giving Type</label>
          <select value={givingType} onChange={e => setGivingType(e.target.value)} className={inputClass}>
            {givingTypes.map(type => <option key={type}>{type}</option>)}
          </select>
        </div>
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-accent text-accent-contrast py-3 rounded-2xl text-sm font-semibold hover:bg-accent-strong transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : 'Record Giving'}
        </button>
      </div>

      <div className="bg-surface rounded-3xl border border-line p-4">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">Entries for this service</p>
        {loading ? <SkeletonList rows={3} /> : services.length === 0 ? (
          <EmptyState type="services" />
        ) : (
          <>
            <div className="flex gap-2 flex-wrap mb-4">
              {services.map(s => (
                <div key={s._id} className="relative flex items-center">
                  <button
                    onClick={() => setActiveServiceId(s._id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors pr-7 ${
                      activeServiceId === s._id
                        ? 'bg-accent text-accent-contrast border-accent'
                        : 'border-line text-muted hover:bg-surface-2'
                    }`}>
                    {formatService(s)}
                  </button>
                  <button
                    onClick={() => confirmDeleteService(s._id)}
                    className="absolute right-2 text-xs text-muted hover:text-danger transition-colors">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {entries.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No entries for this service yet.</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left text-xs text-muted font-medium pb-2">Name</th>
                      <th className="text-left text-xs text-muted font-medium pb-2">Type</th>
                      <th className="text-right text-xs text-muted font-medium pb-2">Amount</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={i} className="border-b border-line group">
                        <td className="py-2 text-content">{e.giverName}</td>
                        <td className="py-2"><Badge type={e.givingType} /></td>
                        <td className="py-2 text-right text-content">₱{e.amount.toLocaleString()}</td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => confirmDeleteEntry(e._id)}
                            className="text-muted hover:text-danger transition-colors text-xs opacity-0 group-hover:opacity-100">
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-3 text-sm text-muted">
                  Service total: <span className="font-semibold text-accent ml-1">₱{serviceTotal.toLocaleString()}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="bg-surface rounded-3xl border border-line p-4">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">Monthly Allocations</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(alloc).map(([key, percent], i) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            const base = tithesOffering * ((percent || 0) / 100)
            const specific = entries
              .filter(e => e.givingType.toLowerCase() === label.toLowerCase())
              .reduce((sum, e) => sum + e.amount, 0)
            return (
              <div key={i} className="bg-surface-2 rounded-2xl p-3.5 border-l-4 border-accent">
                <p className="text-xs text-muted">{label} ({percent}%)</p>
                <p className="text-sm font-semibold text-content mt-1">₱{base.toLocaleString()}</p>
                {specific > 0 && <p className="text-xs text-accent mt-0.5">+ ₱{specific.toLocaleString()} specific</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}