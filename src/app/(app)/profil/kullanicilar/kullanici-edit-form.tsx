'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { kullaniciGuncelle, kullaniciSifreGuncelle } from './actions'
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

  const [sifre, setSifre] = useState('')
  const [sifreGoster, setSifreGoster] = useState(false)
  const [sifreYukleniyor, setSifreYukleniyor] = useState(false)
  const [sifreHata, setSifreHata] = useState('')
  const [sifreBasari, setSifreBasari] = useState(false)

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

  async function sifreKaydet() {
    if (sifre.length < 8) {
      setSifreHata('Şifre en az 8 karakter olmalıdır.')
      return
    }
    setSifreYukleniyor(true)
    setSifreHata('')
    setSifreBasari(false)
    try {
      await kullaniciSifreGuncelle(kullanici.id, sifre)
      setSifre('')
      setSifreBasari(true)
    } catch (e: any) {
      setSifreHata(e.message ?? 'Bir hata oluştu.')
    } finally {
      setSifreYukleniyor(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-gray-900">{kullanici.ad} {kullanici.soyad}</p>
        <p className="text-xs text-gray-400">{kullanici.email}</p>
      </div>

      {/* Rol & Arazi */}
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

      {/* Divider */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Şifre Belirle</p>

        <div className="relative">
          <input
            type={sifreGoster ? 'text' : 'password'}
            value={sifre}
            onChange={e => { setSifre(e.target.value); setSifreBasari(false) }}
            placeholder="Yeni şifre (min. 6 karakter)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => setSifreGoster(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {sifreGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {sifreHata && <p className="text-sm text-red-600 mt-1">{sifreHata}</p>}
        {sifreBasari && <p className="text-sm text-emerald-600 mt-1">✓ Şifre güncellendi.</p>}

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={sifreKaydet}
          disabled={sifreYukleniyor || !sifre}
        >
          {sifreYukleniyor ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </Button>
      </div>
    </div>
  )
}
