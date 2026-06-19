'use client'
import { Home, PenLine, BarChart2, History, Settings } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const navItems = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'record', label: 'Record', icon: PenLine },
  { key: 'report', label: 'Report', icon: BarChart2 },
  { key: 'history', label: 'History', icon: History },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activePage, setActivePage }) {
  const { churchName } = useSettings()

  return (
    <>
      {/* ========== DESKTOP/TABLET SIDEBAR (md and above) ========== */}
      <div className="hidden md:flex w-52 bg-surface border-r border-line flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-line">
          <p className="text-accent text-xs font-semibold tracking-wide uppercase">Tolosa Church</p>
          <p className="text-content text-sm font-medium mt-0.5">{churchName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activePage === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-accent-soft text-accent font-medium'
                    : 'text-content-soft hover:bg-surface-3'
                }`}>
                <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-line">
          <div className="px-3 py-2 text-xs text-muted">Ptr. Cord</div>
        </div>
      </div>

      {/* ========== MOBILE BOTTOM TAB BAR (phone only) ========== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-line flex items-center justify-around px-1 py-2 safe-area-pb">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-colors ${
                isActive ? 'text-accent' : 'text-muted'
              }`}>
              <div className={`px-3 py-1 rounded-full transition-colors ${isActive ? 'bg-accent-soft' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.6} />
              </div>
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
