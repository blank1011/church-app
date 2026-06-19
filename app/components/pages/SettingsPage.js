'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ConfirmModal from '../ConfirmModal'
import { useSettings } from '../../context/SettingsContext'

const cardClass = 'bg-surface rounded-3xl border border-line p-4'
const sectionLabel = 'text-xs uppercase tracking-wide text-muted mb-3'
const inputClass = 'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-content placeholder-muted outline-none focus:border-accent transition-colors'

export default function SettingsPage() {
  const { allocations, setAllocations } = useSettings()

  const [newLabel, setNewLabel] = useState('')
  const [newPercent, setNewPercent] = useState('')
  const [givers, setGivers] = useState([])
  const [editingGiver, setEditingGiver] = useState(null)
  const [editName, setEditName] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null })

  useEffect(() => {
    fetchGivers()
  }, [])

  async function fetchGivers() {
    try {
      const res = await fetch('/api/givers')
      const data = await res.json()
      setGivers(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchName: 'Tolosa Church', allocations, accentColor: '#185FA5' })
      })
      const data = await res.json()
      if (data._id) setMessage({ text: '✅ Settings saved!', type: 'success' })
    } catch (err) {
      setMessage({ text: '❌ Error saving settings.', type: 'error' })
    }
    setSaving(false)
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

async function addAllocation() {
  if (!newLabel.trim() || !newPercent) return
  const key = newLabel.trim().toLowerCase().replace(/\s+/g, '_')
  const updated = { ...allocations, [key]: parseFloat(newPercent) }
  setAllocations(updated)
  setNewLabel('')
  setNewPercent('')

  // Auto-save to DB immediately
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ churchName: 'Tolosa Church', allocations: updated, accentColor: '#185FA5' })
    })
    setMessage({ text: '✅ Allocation added and saved!', type: 'success' })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  } catch (err) {
    console.error(err)
  }
}

async function removeAllocation(key) {
  const updated = { ...allocations }
  delete updated[key]
  setAllocations(updated)

  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ churchName: 'Tolosa Church', allocations: updated, accentColor: '#185FA5' })
    })
    setMessage({ text: '✅ Allocation removed!', type: 'success' })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  } catch (err) {
    console.error(err)
  }
}
  function formatLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  async function renameGiver() {
    if (!editName.trim()) return
    try {
      await fetch(`/api/givers/${encodeURIComponent(editingGiver)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: editName })
      })
      setEditingGiver(null)
      setEditName('')
      fetchGivers()
      setMessage({ text: '✅ Name updated!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  function confirmDeleteGiver(name) {
    setModal({
      open: true,
      title: 'Delete Giver',
      message: `This will permanently delete all giving records for "${name}". This cannot be undone.`,
      onConfirm: async () => {
        setModal({ open: false })
        await fetch(`/api/givers/${encodeURIComponent(name)}`, { method: 'DELETE' })
        fetchGivers()
        setMessage({ text: '✅ Giver deleted.', type: 'success' })
        setTimeout(() => setMessage({ text: '', type: '' }), 3000)
      }
    })
  }

  async function exportData() {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      const csv = [
        ['Name', 'Amount', 'Type', 'Service', 'Date'],
        ...data.map(g => [
          g.giverName, g.amount, g.givingType,
          g.service ? g.service.serviceType : '',
          new Date(g.createdAt).toLocaleDateString('en-PH')
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `church-finance-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setMessage({ text: '✅ Data exported!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const totalPercent = Object.values(allocations || {}).reduce((sum, v) => sum + v, 0)

  return (
    <div className="space-y-4">

      <ConfirmModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ open: false })}
      />

      {message.text && (
        <div className={`text-sm px-4 py-3 rounded-2xl ${
          message.type === 'error'
            ? 'bg-danger-soft text-danger'
            : 'bg-positive-soft text-positive'
        }`}>
          {message.text}
        </div>
      )}

      {/* Allocation Percentages */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <p className={sectionLabel}>Allocation Percentages</p>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            totalPercent === 100
              ? 'bg-positive-soft text-positive'
              : 'text-accent bg-accent-soft'
          }`}>
            {totalPercent}%
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {Object.entries(allocations || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1 bg-surface-2 rounded-xl px-3 py-2.5">
                <p className="text-sm text-content-soft">{formatLabel(key)}</p>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={value}
                onChange={e => setAllocations(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-20 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-content text-center outline-none focus:border-accent transition-colors"
              />
              <span className="text-xs text-muted">%</span>
              <button
                onClick={() => removeAllocation(key)}
                className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger-soft">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="border-t border-line pt-3">
          <p className="text-xs text-muted mb-2">Add new allocation</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Building Fund"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className={`flex-1 ${inputClass}`}
            />
            <input
              type="number"
              placeholder="%"
              value={newPercent}
              onChange={e => setNewPercent(e.target.value)}
              className="w-16 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-content text-center outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={addAllocation}
              className="px-3 py-2 bg-accent text-accent-contrast rounded-xl text-sm font-semibold hover:bg-accent-strong transition-colors flex items-center gap-1">
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full bg-accent text-accent-contrast py-3 rounded-2xl text-sm font-semibold hover:bg-accent-strong transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {/* Manage Givers */}
      <div className={cardClass}>
        <p className={sectionLabel}>Manage Givers</p>
        {givers.length === 0 ? (
          <p className="text-sm text-muted">No givers recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {givers.map((g, i) => (
              <div key={i}>
                {editingGiver === g ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className={`flex-1 ${inputClass}`}
                      autoFocus
                    />
                    <button onClick={renameGiver}
                      className="px-3 py-2 bg-accent text-accent-contrast rounded-xl text-xs font-semibold">
                      Save
                    </button>
                    <button onClick={() => { setEditingGiver(null); setEditName('') }}
                      className="px-3 py-2 border border-line text-content-soft rounded-xl text-xs">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-surface-2 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-accent"
                        style={{ backgroundColor: 'var(--accent-soft)' }}>
                        {g.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm text-content">{g}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingGiver(g); setEditName(g) }}
                        className="text-xs px-2.5 py-1 rounded-lg border border-line text-content-soft hover:bg-surface-3 transition-colors">
                        Rename
                      </button>
                      <button onClick={() => confirmDeleteGiver(g)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-line text-danger hover:bg-danger-soft transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className={cardClass}>
        <p className={sectionLabel}>Export Data</p>
        <p className="text-xs text-muted mb-3">Download all giving records as a CSV file you can open in Excel.</p>
        <button onClick={exportData}
          className="w-full border border-line text-content-soft py-3 rounded-2xl text-sm font-semibold hover:bg-surface-2 transition-colors">
          Export to CSV
        </button>
      </div>

    </div>
  )
}