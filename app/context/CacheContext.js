'use client'

import { createContext, useContext, useMemo, useRef } from 'react'

const CACHE_TTL_MS = 5 * 60 * 1000

const CacheContext = createContext({
  getCache: () => null,
  setCache: () => {},
  clearCacheByKey: () => {},
  clearCache: () => {},
})

function getChurchScope() {
  if (typeof window === 'undefined') return 'server'
  try {
    const raw = localStorage.getItem('church-finance-active-church')
    if (!raw) return 'guest'
    const parsed = JSON.parse(raw)
    return parsed?._id || 'guest'
  } catch {
    return 'guest'
  }
}

function scopeKey(key) {
  return `${getChurchScope()}::${key}`
}

export function CacheProvider({ children }) {
  const cacheRef = useRef({})

  const value = useMemo(() => ({
    getCache: (key) => {
      const scopedKey = scopeKey(key)
      const entry = cacheRef.current[scopedKey]
      if (!entry) return null

      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        delete cacheRef.current[scopedKey]
        return null
      }

      return entry.data
    },

    setCache: (key, data) => {
      const scopedKey = scopeKey(key)
      cacheRef.current[scopedKey] = {
        data,
        timestamp: Date.now(),
      }
    },

    clearCacheByKey: (key) => {
      const scopedKey = scopeKey(key)
      delete cacheRef.current[scopedKey]
    },

    clearCache: () => {
      const scope = `${getChurchScope()}::`
      Object.keys(cacheRef.current).forEach((k) => {
        if (k.startsWith(scope)) delete cacheRef.current[k]
      })
    },
  }), [])

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  return useContext(CacheContext)
}
