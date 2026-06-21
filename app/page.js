'use client'
import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useSettings } from './context/SettingsContext'
import { useTheme } from './components/ThemeProvider'
import { useChurch } from './context/ChurchContext'
import Sidebar from './components/Sidebar'
import LoginPage from './components/pages/LoginPage'
import HomePage from './components/pages/HomePage'
import RecordPage from './components/pages/RecordPage'
import ReportPage from './components/pages/ReportPage'
import HistoryPage from './components/pages/HistoryPage'
import SettingsPage from './components/pages/SettingsPage'
import AdminPage from './components/pages/AdminPage'

const pageTitles = {
  home: 'Dashboard',
  record: 'Record Giving',
  report: 'Monthly Report',
  history: 'History',
  settings: 'Settings',
  admin: 'Admin Console',
}

export default function Home() {
  const [activePage, setActivePage] = useState('home')
  const { theme, setTheme } = useTheme()
  const { churchName } = useSettings()
  const { currentChurch, loadingChurches } = useChurch()

  if (loadingChurches) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading churches...
      </div>
    )
  }

  if (!currentChurch) {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-line bg-surface/60 backdrop-blur-md">
          <div>
            <h1 className="text-sm font-semibold text-content">
              {pageTitles[activePage]}
            </h1>
            <p className="text-xs text-muted">{churchName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-muted">
              {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-surface-2 border border-line text-content-soft hover:bg-surface-3 transition-colors"
              suppressHydrationWarning>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-4 pb-28 md:pb-6 max-w-3xl w-full mx-auto">
          {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
          {activePage === 'record' && <RecordPage />}
          {activePage === 'report' && <ReportPage />}
          {activePage === 'history' && <HistoryPage />}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'admin' && <AdminPage />}
        </div>
      </div>
    </div>
  )
}
