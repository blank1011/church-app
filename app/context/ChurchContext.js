'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'church-finance-active-church'

const ChurchContext = createContext({
  churches: [],
  currentChurch: null,
  loadingChurches: true,
  login: async () => ({ ok: false }),
  logout: () => {},
  createChurch: async () => ({ ok: false }),
  refreshChurches: async () => {},
  churchFetch: async () => {},
})

function readStoredChurch() {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function ChurchProvider({ children }) {
  const [churches, setChurches] = useState([])
  const [currentChurch, setCurrentChurch] = useState(null)
  const [loadingChurches, setLoadingChurches] = useState(true)

  const refreshChurches = useCallback(async () => {
    try {
      const res = await fetch('/api/churches')
      const data = await res.json()
      setChurches(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setChurches([])
    } finally {
      setLoadingChurches(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    window.setTimeout(() => {
      if (!ignore) setCurrentChurch(readStoredChurch())
    }, 0)

    async function loadChurches() {
      try {
        const res = await fetch('/api/churches')
        const data = await res.json()
        if (!ignore) setChurches(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        if (!ignore) setChurches([])
      } finally {
        if (!ignore) setLoadingChurches(false)
      }
    }

    loadChurches()

    return () => {
      ignore = true
    }
  }, [])

  const login = useCallback(async (churchId, accessCode) => {
    try {
      const res = await fetch('/api/churches/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId, accessCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { ok: false, error: data.error || 'Login failed.' }
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setCurrentChurch(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setCurrentChurch(null)
  }, [])

  const createChurch = useCallback(async ({ name, accessCode }) => {
    try {
      const res = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, accessCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { ok: false, error: data.error || 'Unable to create church.' }
      }

      await refreshChurches()
      return { ok: true, church: data }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }, [refreshChurches])

  const churchFetch = useCallback((url, options = {}) => {
    const headers = new Headers(options.headers || {})
    if (currentChurch?._id) {
      headers.set('x-church-id', currentChurch._id)
    }

    const method = (options.method || 'GET').toUpperCase()
    const fetchOptions = {
      ...options,
      headers,
    }

    if (method === 'GET' && !options.cache) {
      fetchOptions.cache = 'no-store'
    }

    return fetch(url, fetchOptions)
  }, [currentChurch])

  const value = useMemo(() => ({
    churches,
    currentChurch,
    loadingChurches,
    login,
    logout,
    createChurch,
    refreshChurches,
    churchFetch,
  }), [churches, currentChurch, loadingChurches, login, logout, createChurch, refreshChurches, churchFetch])

  return (
    <ChurchContext.Provider value={value}>
      {children}
    </ChurchContext.Provider>
  )
}

export function useChurch() {
  return useContext(ChurchContext)
}
