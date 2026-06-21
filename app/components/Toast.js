'use client'
import { useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { haptic } from '../lib/haptic'

const ToastContext = createContext({ addToast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    // Trigger haptic feedback based on toast type
    if (type === 'error') {
      haptic.error()
    } else {
      haptic.success()
    }
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border pointer-events-auto ${
              toast.type === 'error'
                ? 'bg-surface border-danger text-danger'
                : 'bg-surface border-line text-content'
            }`}>
            {toast.type === 'error'
              ? <XCircle size={16} className="shrink-0 text-danger" />
              : <CheckCircle size={16} className="shrink-0 text-positive" />
            }
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-content transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
