'use client'
import { useState } from 'react'
import { Menu, X, PenLine, BarChart2, History, Settings, Home, Shield, LogOut } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useChurch } from '../context/ChurchContext'

const navItems = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'record', label: 'Record', icon: PenLine },
  { key: 'report', label: 'Report', icon: BarChart2 },
  { key: 'history', label: 'History', icon: History },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activePage, setActivePage }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentChurch, logout } = useChurch()

  function handleNav(key) {
    setActivePage(key)
    setMobileOpen(false)
  }

  const NavItems = ({ onClick }) => (
    <>
      {navItems.map(item => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            onClick={() => { handleNav(item.key); onClick?.() }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              activePage === item.key
                ? 'bg-white/15 text-white'
                : 'text-[#B5D4F4] hover:bg-white/10'
            }`}>
            <Icon size={15} />
            {item.label}
          </button>
        )
      })}
      {currentChurch?.isDefault && (
        <button
          onClick={() => { handleNav('admin'); onClick?.() }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            activePage === 'admin'
              ? 'bg-white/15 text-white'
              : 'text-[#B5D4F4] hover:bg-white/10'
          }`}>
          <Shield size={15} />
          Admin
        </button>
      )}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-48 bg-[#0C447C] flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <p className="text-[#B5D4F4] text-xs font-medium">{currentChurch?.name || 'Church'}</p>
          <p className="text-white text-sm font-medium mt-0.5">Finance</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          <NavItems />
        </nav>
        <div className="p-2 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#B5D4F4] hover:bg-white/10 transition-colors flex items-center gap-2">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>


      {/* Mobile Bottom Tab Bar - Curved Pill */}
      <div className="md:hidden fixed bottom-6 left-3 right-3 z-50">
        <div className="flex items-center justify-around gap-0.5 rounded-full border border-cyan-500/20 bg-gradient-to-t from-slate-950 to-slate-900 px-2 py-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activePage === item.key
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? 'text-cyan-300 scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500/30 text-cyan-300 shadow-[0_10px_25px_rgba(34,211,238,0.15)]'
                    : 'bg-transparent'
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${
                  isActive ? 'text-cyan-300' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}