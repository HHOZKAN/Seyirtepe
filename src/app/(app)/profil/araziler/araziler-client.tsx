'use client'

import { useState, useTransition } from 'react'
import { araziSahibiGuncelle } from './actions'

interface Arazi {
  id: string
  numara: number
  alan_m2: number
  profiller: { id?: string; ad: string; soyad: string }[] | null
}

interface Profil {
  id: string
  ad: string
  soyad: string
  arazi_id: string | null
}

export function ArazilerClient({
  araziler,
  profiller,
}: {
  araziler: Arazi[]
  profiller: Profil[]
}) {
  const [secili, setSecili] = useState<Arazi | null>(null)
  const [yeniSahibiId, setYeniSahibiId] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [hata, setHata] = useState('')

  function acModal(a: Arazi) {
    const mevcutSahip = Array.isArray(a.profiller) ? a.profiller[0] : a.profiller
    setYeniSahibiId((mevcutSahip as any)?.id ?? '')
    setHata('')
    setSecili(a)
  }

  function kaydet() {
    if (!secili) return
    startTransition(async () => {
      try {
        await araziSahibiGuncelle(secili.id, yeniSahibiId || null)
        setSecili(null)
      } catch (e: any) {
        setHata(e.message)
      }
    })
  }

  const mevcutSahibAdi = (a: Arazi) => {
    const sahip = Array.isArray(a.profiller) ? a.profiller[0] : a.profiller
    return sahip ? `${sahip.ad} ${sahip.soyad}` : null
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">{araziler.length} arazi</p>
      <div className="grid grid-cols-2 gap-2">
        {araziler.map((a) => (
          <button
            key={a.id}
            onClick={() => acModal(a)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-bold text-gray-900">#{a.numara}</span>
              <span className="text-xs text-gray-400">{a.alan_m2} m²</span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {mevcutSahibAdi(a) ?? (
                <span className="text-gray-300 italic text-xs">Atanmamış</span>
              )}
            </p>
            <p className="text-xs text-emerald-600 mt-1">Düzenle →</p>
          </button>
        ))}
      </div>

      {/* Modal */}
      {secili && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSecili(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl px-4 pt-5 pb-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
            <h2 className="text-base font-semibold text-gray-900">
              Arazi #{secili.numara} — Sahip Değiştir
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Sahip</label>
              <select
                value={yeniSahibiId}
                onChange={(e) => setYeniSahibiId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Atanmamış —</option>
                {profiller.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ad} {p.soyad}
                    {p.arazi_id && p.arazi_id !== secili.id ? ' (başka araziye atanmış)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {hata && <p className="text-sm text-red-600">{hata}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setSecili(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700"
              >
                İptal
              </button>
              <button
                onClick={kaydet}
                disabled={isPending}
                className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {isPending ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
