'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { kullaniciGuncelle } from './actions'
import type { KullaniciRolu } from '@/lib/types'

const ROLLER: { value: KullaniciRolu; label: string }[] = [
  { value: 'baskan', label: 'Başkan' },
  { value: 'sayman', label: 'Sayman' },
  { value: 'sekreter', label: 'Sekreter' },
  { value: 'admin', label: 'Admin' },
  { value: 'arazi_sahibi', label: 'Arazi Sahibi' },
]

export function KullaniciEditForm({
  kullanici,
  araziler,
  onClose,
}: {
  kullanici: any
  araziler: any[]
  onClose: () => void
}) {
  const [rol, setRol] = useState<KullaniciRolu>(kullanici.rol)
  const [araziId, setAraziId] = useState<string>(kullanici.arazi_id ?? '')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')

  async function kaydet() {
    setYukleniyor(true)
    setHata('')
    try {
      await kullaniciGuncelle(kullanici.id, rol, araziId || null)
      onClose()
    } catch {
      setHata('Bir hata oluştu, tekrar deneyin.')
      setYukleniyor(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-gray-900">{kullanici.ad} {kullanici.soyad}</p>
        <p className="text-xs text-gray-400">{kullanici.email}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select
          value={rol}
          onChange={e => setRol(e.target.value as KullaniciRolu)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {ROLLER.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Arazi</label>
        <select
          value={araziId}
          onChange={e => setAraziId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Atanmamış</option>
          {araziler.map((a: any) => (
            <option key={a.id} value={a.id}>
              Arazi #{a.numara}{a.profiller && a.profiller.id !== kullanici.id ? ` (${a.profiller.ad} ${a.profiller.soyad})` : ''}
            </option>
          ))}
        </select>
      </div>

      {hata && <p className="text-sm text-red-600">{hata}</p>}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={yukleniyor}>
          İptal
        </Button>
        <Button className="flex-1" onClick={kaydet} disabled={yukleniyor}>
          {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
