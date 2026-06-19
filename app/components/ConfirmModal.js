'use client'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-3xl shadow-2xl p-6 w-80 mx-4 border border-line">

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--danger-soft)' }}>
          <span className="text-danger text-xl">🗑</span>
        </div>

        {/* Text */}
        <h3 className="text-sm font-semibold text-content text-center mb-1">
          {title}
        </h3>
        <p className="text-xs text-muted text-center mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-line text-sm text-content-soft hover:bg-surface-3 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-danger hover:opacity-90 text-white text-sm font-medium transition-opacity">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
