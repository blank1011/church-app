'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext({
  churchName: 'Tolosa Church',
  accentColor: '#185FA5',
  allocations: {
    pastoralTithe: 20,
    electricBill: 20,
    missionMyanmar: 20,
    conferencePledge: 20,
  },
  setChurchName: () => {},
  setAccentColor: () => {},
  setAllocations: () => {},
  refreshSettings: () => {},
})

export function SettingsProvider({ children }) {
  const [churchName, setChurchName] = useState('Tolosa Church')
  const [accentColor, setAccentColor] = useState('#185FA5')
  const [allocations, setAllocations] = useState({
    pastoralTithe: 20,
    electricBill: 20,
    missionMyanmar: 20,
    conferencePledge: 20,
  })

useEffect(() => {
  document.documentElement.style.setProperty('--accent-color', accentColor)
  // darken the accent by setting a darker version for hover
  document.documentElement.style.setProperty('--accent-dark', accentColor)
}, [accentColor])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
  }, [accentColor])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.churchName) setChurchName(data.churchName)
      if (data.accentColor) setAccentColor(data.accentColor)
      if (data.allocations) setAllocations(data.allocations)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{
      churchName,
      setChurchName,
      accentColor,
      setAccentColor,
      allocations,
      setAllocations,
      refreshSettings: fetchSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}