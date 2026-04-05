'use client'

import { createContext, useContext } from 'react'
import type { Profil } from '@/lib/types'

const ProfilContext = createContext<Profil | null>(null)

export function ProfilProvider({ profil, children }: { profil: Profil; children: React.ReactNode }) {
  return <ProfilContext.Provider value={profil}>{children}</ProfilContext.Provider>
}

export function useProfil(): Profil {
  const ctx = useContext(ProfilContext)
  if (!ctx) throw new Error('useProfil must be used within ProfilProvider')
  return ctx
}
