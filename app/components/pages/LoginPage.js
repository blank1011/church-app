'use client'
import { useState } from 'react'
import { Church, LockKeyhole, Plus } from 'lucide-react'
import { useChurch } from '../../context/ChurchContext'

const inputClass = 'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-content placeholder-muted outline-none focus:border-accent transition-colors'

export default function LoginPage() {
  const { churches, loadingChurches, login, createChurch } = useChurch()
  const [churchId, setChurchId] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [newChurchName, setNewChurchName] = useState('')
  const [newChurchAccessCode, setNewChurchAccessCode] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [creating, setCreating] = useState(false)

  const selectedChurchId = churchId || churches[0]?._id || ''

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await login(selectedChurchId, accessCode)
    if (!result.ok) {
      setError(result.error || 'Unable to login.')
    }

    setSubmitting(false)
  }

  async function handleCreateChurch(e) {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    setCreating(true)

    const result = await createChurch({ name: newChurchName, accessCode: newChurchAccessCode })
    if (result.ok) {
      setNewChurchName('')
      setNewChurchAccessCode('')
      setChurchId(result.church._id)
      setCreateSuccess('Church created. You can now select it and log in.')
    } else {
      setCreateError(result.error || 'Unable to create church.')
    }

    setCreating(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-5 shadow-xl">
        <div className="mb-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Church size={21} />
          </div>
          <h1 className="text-lg font-semibold text-content">Church Finance Login</h1>
          <p className="mt-1 text-sm text-muted">Choose a church and enter its recorder access code.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Church</label>
            <select
              value={selectedChurchId}
              onChange={e => setChurchId(e.target.value)}
              className={inputClass}
              disabled={loadingChurches || churches.length === 0}>
              {churches.length === 0 ? (
                <option>No churches available</option>
              ) : churches.map(church => (
                <option key={church._id} value={church._id}>{church.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Access Code</label>
            <div className="relative">
              <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
                placeholder="Enter access code"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {churches.length === 0 && !loadingChurches && (
            <p className="text-sm text-muted">No churches are available yet. Create the first church below to continue.</p>
          )}

          {churches.length === 1 && !churchId && !loadingChurches && churches[0].isDefault && (
            <p className="text-sm text-muted">Default access code: <span className="font-semibold">tolosa2024</span></p>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !selectedChurchId || !accessCode}
            className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-50">
            {submitting ? 'Logging in...' : 'Open Recorder'}
          </button>
        </div>
      </form>

      {churches.length === 0 && !loadingChurches && (
        <form onSubmit={handleCreateChurch} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-3 text-content">
            <Plus size={21} className="text-accent" />
            <div>
              <h2 className="text-lg font-semibold">Create First Church</h2>
              <p className="text-sm text-muted">Add the initial church recorder so you can log in.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Church Name</label>
              <input
                value={newChurchName}
                onChange={e => setNewChurchName(e.target.value)}
                placeholder="e.g. New Hope Church"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Recorder Access Code</label>
              <input
                value={newChurchAccessCode}
                onChange={e => setNewChurchAccessCode(e.target.value)}
                placeholder="Enter a secure access code"
                className={inputClass}
              />
            </div>

            {createError && <p className="text-sm text-danger">{createError}</p>}
            {createSuccess && <p className="text-sm text-success">{createSuccess}</p>}

            <button
              type="submit"
              disabled={creating || !newChurchName.trim() || !newChurchAccessCode.trim()}
              className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Church'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
