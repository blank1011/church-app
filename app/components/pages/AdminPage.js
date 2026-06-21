'use client'
import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { useChurch } from '../../context/ChurchContext'
import { useToast } from '../Toast'

const cardClass = 'bg-surface rounded-3xl border border-line p-4'
const sectionLabel = 'text-xs uppercase tracking-wide text-muted mb-3'
const inputClass = 'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-content placeholder-muted outline-none focus:border-accent transition-colors'

export default function AdminPage() {
  const { churches, createChurch } = useChurch()
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreateChurch(e) {
    e.preventDefault()
    setSaving(true)

    const result = await createChurch({ name, accessCode })
    if (result.ok) {
      setName('')
      setAccessCode('')
      addToast('Church created!')
    } else {
      addToast(result.error || 'Unable to create church.', 'error')
    }

    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <p className={sectionLabel}>Create Church Recorder</p>
        <form onSubmit={handleCreateChurch} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Church Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. New Hope Church"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Recorder Access Code</label>
            <input
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="Give this code to that church recorder"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim() || !accessCode.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-50">
            <Plus size={16} />
            {saving ? 'Creating...' : 'Create Church'}
          </button>
        </form>
      </div>

      <div className={cardClass}>
        <p className={sectionLabel}>Churches</p>
        {churches.length === 0 ? (
          <p className="text-sm text-muted">No churches available.</p>
        ) : (
          <div className="space-y-2">
            {churches.map(church => (
              <div key={church._id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-content">{church.name}</p>
                  <p className="text-xs text-muted">{church.slug}</p>
                </div>
                {church.isDefault && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">Default</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
