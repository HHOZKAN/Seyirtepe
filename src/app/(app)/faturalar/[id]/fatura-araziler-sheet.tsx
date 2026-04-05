'use client'

import { useState, useTransition } from 'react'
import { Grid2x2 } from 'lucide-react'
import { faturaArazilerGuncelle } from './actions'

interface AraziRow {
  id: string
  numara: number
}

interface FaturaArazi {
  arazi_id: string
  odeme_durumu: string | null
}

interface Props {
  faturaId: string
  faturaToplamTutar: number
  tumAraziler: AraziRow[]
  mevcutFaturaAraziler: FaturaArazi[]
}

export function FaturaArazilerSheet({
  faturaId,
  faturaToplamTutar,
  tumAraziler,
  mevcutFaturaAraziler,
}: Props) {
  const [acik, setAcik] = useState(false)

  // Ödeme yapılmış arazi_id'leri — bunlar değiştirilemez
  const odemeyapilmis = new Set(
    mevcutFaturaAraziler.filter((fa) => fa.odeme_durumu).map((fa) => fa.arazi_id)
  )

  const baslangicSecili = new Set(mevcutFaturaAraziler.map((fa) => fa.arazi_id))
  const [secili, setSecili] = useState<Set<string>>(new Set(baslangicSecili))
  const [hata, setHata] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle(araziId: string) {
    if (odemeyapilmis.has(araziId)) return // kilitli
    setSecili((prev) => {
      const next = new Set(prev)
      next.has(araziId) ? next.delete(araziId) : next.add(araziId)
      return next
    })
  }

  function tumunuSec() {
    if (secili.size === tumAraziler.length) {
      // Sadece kilitlileri bırak
      setSecili(new Set(odemeyapilmis))
    } else {
      setSecili(new Set(tumAraziler.map((a) => a.id)))
    }
  }

  function kaydet() {
    if (secili.size === 0) {
      setHata('En az bir arazi seçilmelidir.')
      return
    }
    setHata('')
    startTransition(async () => {
      try {
        await faturaArazilerGuncelle(faturaId, faturaToplamTutar, Array.from(secili))
        setAcik(false)
      } catch (e: any) {
        setHata(e.message)
      }
    })
  }

  const payTutar = secili.size > 0 ? faturaToplamTutar / secili.size : 0

  return (
    <>
      <button
        onClick={() => {
          setSecili(new Set(baslangicSecili))
          setHata('')
          setAcik(true)
        }}
        className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"
      >
        <Grid2x2 className="w-4 h-4" />
        Arazileri Düzenle
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setAcik(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl px-4 pt-5 pb-8 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Araziler ({secili.size} seçili)
              </h2>
              <button onClick={tumunuSec} className="text-xs text-emerald-600 font-medium">
                {secili.size === tumAraziler.length ? 'Temizle' : 'Tümünü seç'}
              </button>
            </div>

            {secili.size > 0 && (
              <p className="text-xs text-gray-500">
                Her arazi: ₺{payTutar.toFixed(2)} (toplam ₺{faturaToplamTutar.toLocaleString('tr-TR')})
              </p>
            )}

            {odemeyapilmis.size > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                🔒 Ödeme beyan edilmiş araziler kaldırılamaz.
              </p>
            )}

            <div className="grid grid-cols-5 gap-1.5">
              {tumAraziler.map((a) => {
                const isSecili = secili.has(a.id)
                const isKilitli = odemeyapilmis.has(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => toggle(a.id)}
                    disabled={isKilitli}
                    className={`aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center relative ${
                      isKilitli
                        ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                        : isSecili
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {a.numara}
                    {isKilitli && (
                      <span className="absolute top-0.5 right-0.5 text-[8px]">🔒</span>
                    )}
                  </button>
                )
              })}
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
