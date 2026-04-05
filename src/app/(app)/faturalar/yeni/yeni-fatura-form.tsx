'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { GiderTipi } from '@/lib/types'

function generateRef() {
  const d = new Date()
  return `FAT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`
}

export function YeniFaturaForm({
  giderTipleri,
  araziler,
  olusturanId,
}: {
  giderTipleri: GiderTipi[]
  araziler: any[]
  olusturanId: string
}) {
  const router = useRouter()
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [seciliAraziler, setSeciliAraziler] = useState<string[]>([])
  const [form, setForm] = useState({
    gider_tipi_id: '',
    baslik: '',
    aciklama: '',
    tutar: '',
    vade_tarihi: '',
  })

  function toggleArazi(id: string) {
    setSeciliAraziler(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function tumunuSec() {
    setSeciliAraziler(
      seciliAraziler.length === araziler.length ? [] : araziler.map(a => a.id)
    )
  }

  async function kaydet(durum: 'taslak' | 'gonderildi') {
    if (!form.baslik || !form.tutar || !form.vade_tarihi) {
      setHata('Başlık, tutar ve vade tarihi zorunludur.')
      return
    }
    if (durum === 'gonderildi' && !seciliAraziler.length) {
      setHata('Fatura göndermek için en az bir arazi seçiniz.')
      return
    }
    setHata('')
    setYukleniyor(true)

    const supabase = createClient()
    const tutar = parseFloat(form.tutar)

    const { data: fatura, error } = await supabase
      .from('faturalar')
      .insert({
        referans: generateRef(),
        gider_tipi_id: form.gider_tipi_id || null,
        baslik: form.baslik,
        aciklama: form.aciklama || null,
        tutar,
        vade_tarihi: form.vade_tarihi,
        durum,
        olusturan: olusturanId,
      })
      .select()
      .single()

    if (error || !fatura) {
      setHata('Bir hata oluştu, tekrar deneyin.')
      setYukleniyor(false)
      return
    }

    if (seciliAraziler.length) {
      const payTutar = tutar / seciliAraziler.length
      await supabase.from('fatura_araziler').insert(
        seciliAraziler.map(arazi_id => ({
          fatura_id: fatura.id,
          arazi_id,
          tutar: Math.round(payTutar * 100) / 100,
        }))
      )
    }

    router.push(`/faturalar/${fatura.id}`)
    router.refresh()
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gider Tipi</label>
          <select
            value={form.gider_tipi_id}
            onChange={e => setForm(f => ({ ...f, gider_tipi_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Seçiniz (isteğe bağlı)</option>
            {giderTipleri.map(g => (
              <option key={g.id} value={g.id}>{g.ad}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
          <input
            type="text"
            value={form.baslik}
            onChange={e => setForm(f => ({ ...f, baslik: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Fatura başlığı"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={form.aciklama}
            onChange={e => setForm(f => ({ ...f, aciklama: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="İsteğe bağlı"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Toplam Tutar (₺) *</label>
            <input
              type="number"
              value={form.tutar}
              onChange={e => setForm(f => ({ ...f, tutar: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vade Tarihi *</label>
            <input
              type="date"
              value={form.vade_tarihi}
              onChange={e => setForm(f => ({ ...f, vade_tarihi: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Araziler ({seciliAraziler.length} seçili)
          </label>
          <button onClick={tumunuSec} className="text-xs text-emerald-600 font-medium">
            {seciliAraziler.length === araziler.length ? 'Temizle' : 'Tümünü seç'}
          </button>
        </div>
        {form.tutar && seciliAraziler.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">
            Her arazi: ₺{(parseFloat(form.tutar) / seciliAraziler.length).toFixed(2)}
          </p>
        )}
        <div className="grid grid-cols-5 gap-1.5">
          {araziler.map((a: any) => {
            const secili = seciliAraziler.includes(a.id)
            return (
              <button
                key={a.id}
                onClick={() => toggleArazi(a.id)}
                className={`aspect-square rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center ${
                  secili
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {a.numara}
              </button>
            )
          })}
        </div>
      </div>

      {hata && <p className="text-sm text-red-600">{hata}</p>}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => kaydet('taslak')}
          disabled={yukleniyor}
        >
          Taslak Kaydet
        </Button>
        <Button
          className="flex-1"
          onClick={() => kaydet('gonderildi')}
          disabled={yukleniyor}
        >
          Gönder
        </Button>
      </div>
    </div>
  )
}
