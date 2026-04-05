'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { kullaniciDavetEt } from './actions'
import type { KullaniciRolu } from '@/lib/types'

const ROLLER: { value: KullaniciRolu; label: string }[] = [
  { value: 'arazi_sahibi', label: 'Arazi Sahibi' },
  { value: 'sekreter', label: 'Sekreter' },
  { value: 'sayman', label: 'Sayman' },
  { value: 'admin', label: 'Admin' },
  { value: 'baskan', label: 'Başkan' },
]

export function DavetForm({ araziler, onClose }: { araziler: any[]; onClose: () => void }) {
  const [form, setForm] = useState({ email: '', ad: '', soyad: '', rol: 'arazi_sahibi' as KullaniciRolu, araziId: '' })
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [basari, setBasari] = useState(false)

  async function davetGonder() {
    if (!form.email || !form.ad || !form.soyad) { setHata('Email, ad ve soyad zorunludur.'); return }
    setYukleniyor(true)
    setHata('')
    try {
      await kullaniciDavetEt(form.email, form.ad, form.soyad, form.rol, form.araziId || null)
      setBasari(true)
    } catch (e: any) {
      setHata(e.message ?? 'Bir hata oluştu.')
      setYukleniyor(false)
    }
  }

  if (basari) {
    return (
      <div className="text-center py-4 space-y-3">
        <p className="text-4xl">✉️</p>
        <p className="font-semibold text-gray-900">Davet gönderildi!</p>
        <p className="text-sm text-gray-500">{form.email} adresine davet e-postası iletildi.</p>
        <Button className="w-full" onClick={onClose}>Tamam</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
          <input
            type="text"
            value={form.ad}
            onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ad"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
          <input
            type="text"
            value={form.soyad}
            onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Soyad"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="ornek@mail.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select
          value={form.rol}
          onChange={e => setForm(f => ({ ...f, rol: e.target.value as KullaniciRolu }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {ROLLER.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Arazi</label>
        <select
          value={form.araziId}
          onChange={e => setForm(f => ({ ...f, araziId: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Atanmamış</option>
          {araziler.map((a: any) => (
            <option key={a.id} value={a.id}>
              Arazi #{a.numara}{a.profiller ? ` — ${a.profiller.ad} ${a.profiller.soyad}` : ''}
            </option>
          ))}
        </select>
      </div>

      {hata && <p className="text-sm text-red-600">{hata}</p>}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={yukleniyor}>İptal</Button>
        <Button className="flex-1" onClick={davetGonder} disabled={yukleniyor}>
          {yukleniyor ? 'Gönderiliyor...' : 'Davet Gönder'}
        </Button>
      </div>
    </div>
  )
}
