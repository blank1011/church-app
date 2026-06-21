'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
})

const THEME_KEY = 'church-finance-theme'

function getStoredTheme() {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem(THEME_KEY)
  return storedTheme === 'dark' ? 'dark' : 'light'
}

function subscribeToThemeChanges(callback) {
  if (typeof window === 'undefined') return () => {}

  function handleStorage(event) {
    if (event.key === THEME_KEY) callback()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener('theme-change', callback)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener('theme-change', callback)
  }
}

export default function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getStoredTheme,
    () => 'light'
  )

  const setTheme = useCallback((nextTheme) => {
    const themeValue = nextTheme === 'dark' ? 'dark' : 'light'

    window.localStorage.setItem(THEME_KEY, themeValue)
    window.dispatchEvent(new Event('theme-change'))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
