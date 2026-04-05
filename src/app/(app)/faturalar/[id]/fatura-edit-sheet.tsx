'use client'

import { useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { faturaGuncelle } from './actions'
import type { GiderTipi } from '@/lib/types'

interface Props {
  faturaId: string
  baslangic: {
    baslik: string
    aciklama: string | null
    tutar: number
    vade_tarihi: string
    gider_tipi_id: string | null
  }
  giderTipleri: GiderTipi[]
}

export function FaturaEditSheet({ faturaId, baslangic, giderTipleri }: Props) {
  const [acik, setAcik] = useState(false)
  const [form, setForm] = useState({
    baslik: baslangic.baslik,
    aciklama: baslangic.aciklama ?? '',
    tutar: String(baslangic.tutar),
    vade_tarihi: baslangic.vade_tarihi.slice(0, 10),
    gider_tipi_id: baslangic.gider_tipi_id ?? '',
  })
  const [hata, setHata] = useState('')
  const [isPending, startTransition] = useTransition()

  function kaydet() {
    if (!form.baslik || !form.tutar || !form.vade_tarihi) {
      setHata('Başlık, tutar ve vade tarihi zorunludur.')
      return
    }
    setHata('')
    startTransition(async () => {
      try {
        await faturaGuncelle(faturaId, {
          baslik: form.baslik,
          aciklama: form.aciklama || null,
          tutar: parseFloat(form.tutar),
          vade_tarihi: form.vade_tarihi,
          gider_tipi_id: form.gider_tipi_id || null,
        })
        setAcik(false)
      } catch (e: any) {
        setHata(e.message)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setAcik(true)}
        className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"
      >
        <Pencil className="w-4 h-4" />
        Düzenle
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setAcik(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl px-4 pt-5 pb-8 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
            <h2 className="text-base font-semibold text-gray-900">Faturayı Düzenle</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gider Tipi</label>
              <select
                value={form.gider_tipi_id}
                onChange={(e) => setForm((f) => ({ ...f, gider_tipi_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Seçiniz (isteğe bağlı)</option>
                {giderTipleri.map((g) => (
                  <option key={g.id} value={g.id}>{g.ad}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
              <input
                type="text"
                value={form.baslik}
                onChange={(e) => setForm((f) => ({ ...f, baslik: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={form.aciklama}
                onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺) *</label>
                <input
                  type="number"
                  value={form.tutar}
                  onChange={(e) => setForm((f) => ({ ...f, tutar: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vade Tarihi *</label>
                <input
                  type="date"
                  value={form.vade_tarihi}
                  onChange={(e) => setForm((f) => ({ ...f, vade_tarihi: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {hata && <p className="text-sm text-red-600">{hata}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setAcik(false)}
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
