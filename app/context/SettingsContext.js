'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext({
  allocations: {
    pastoralTithe: 20,
    electricBill: 20,
    missionMyanmar: 20,
    conferencePledge: 20,
    fellowship: 10,
  },
  setAllocations: () => {},
  refreshSettings: () => {},
})

const defaultAllocations = {
  pastoralTithe: 20,
  electricBill: 20,
  missionMyanmar: 20,
  conferencePledge: 20,
  fellowship: 10,
}

export function SettingsProvider({ children }) {
  const [allocations, setAllocations] = useState(defaultAllocations)

  // Settings are now loaded per-church in SettingsPage
  // This context just holds the current state

  return (
    <SettingsContext.Provider value={{
      allocations,
      setAllocations,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}