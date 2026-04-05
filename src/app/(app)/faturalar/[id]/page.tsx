import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isAdmin, isYonetici } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { FaturaBadge, OdemeBadge, OdenmediBadge } from '@/components/shared/status-badge'
import { FaturaDurumActions } from './fatura-durum-actions'
import { OdemeBeyanSheet } from './odeme-beyan-sheet'
import { FaturaEditSheet } from './fatura-edit-sheet'
import type { Profil, GiderTipi } from '@/lib/types'

export default async function FaturaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()
  const yonetici = isYonetici((profil as Profil).rol)
  const admin = isAdmin((profil as Profil).rol)

  const [{ data: fatura }, { data: giderTipleri }] = await Promise.all([
    supabase.from('faturalar').select('*, gider_tipleri(ad)').eq('id', id).single(),
    supabase.from('gider_tipleri').select('*').eq('aktif', true).order('ad'),
  ])

  if (!fatura) notFound()

  let faturaArazilerQuery = supabase
    .from('fatura_araziler')
    .select('*, araziler(numara), odemeler(id, durum, havale_tarihi, banka, dekont_url, yonetici_notu)')
    .eq('fatura_id', id)
    .order('olusturulma_tarihi')

  if (!yonetici) {
    faturaArazilerQuery = faturaArazilerQuery.eq('arazi_id', (profil as Profil).arazi_id!)
  }

  const { data: faturaAraziler } = await faturaArazilerQuery

  const kisiselFa = !yonetici ? faturaAraziler?.[0] : null
  const odemeYapilabilir = kisiselFa && !kisiselFa.odeme_durumu && fatura.durum === 'gonderildi'

  return (
    <div>
      <PageHeader title="Fatura Detayı" backHref="/faturalar" />

      <div className="px-4 py-5 space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{fatura.baslik}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fatura.referans}</p>
            </div>
            <FaturaBadge durum={fatura.durum} />
          </div>
          {admin && (
            <FaturaEditSheet
              faturaId={id}
              baslangic={{
                baslik: fatura.baslik,
                aciklama: fatura.aciklama,
                tutar: fatura.tutar,
                vade_tarihi: fatura.vade_tarihi,
                gider_tipi_id: fatura.gider_tipi_id,
              }}
              giderTipleri={(giderTipleri ?? []) as GiderTipi[]}
            />
          )}
          {fatura.gider_tipleri && (
            <p className="text-sm text-gray-500">{(fatura.gider_tipleri as any).ad}</p>
          )}
          {fatura.aciklama && (
            <p className="text-sm text-gray-600">{fatura.aciklama}</p>
          )}
          <div className="flex gap-4 pt-1">
            <div>
              <p className="text-xs text-gray-400">Toplam Tutar</p>
              <p className="font-semibold text-gray-900">₺{Number(fatura.tutar).toLocaleString('tr-TR')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vade Tarihi</p>
              <p className="font-semibold text-gray-900">
                {new Date(fatura.vade_tarihi).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        {admin && <FaturaDurumActions faturaId={id} mevcutDurum={fatura.durum} />}

        {odemeYapilabilir && (
          <OdemeBeyanSheet faturaAraziId={kisiselFa.id} faturaBaslik={fatura.baslik} />
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            {yonetici ? 'Arazi Ödemeleri' : 'Ödeme Durumum'}
          </h3>
          <div className="space-y-2">
            {(faturaAraziler ?? []).map((fa: any) => (
              <div key={fa.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div>
                    {yonetici && (
                      <p className="text-sm font-medium text-gray-900">Arazi {fa.araziler?.numara}</p>
                    )}
                    <p className="text-sm text-gray-600">₺{Number(fa.tutar).toLocaleString('tr-TR')}</p>
                  </div>
                  {fa.odeme_durumu ? <OdemeBadge durum={fa.odeme_durumu} /> : <OdenmediBadge />}
                </div>
                {fa.odemeler?.[0]?.yonetici_notu && (
                  <p className="text-xs text-red-600 mt-2 bg-red-50 rounded p-2">
                    Not: {fa.odemeler[0].yonetici_notu}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
