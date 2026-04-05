import { createClient } from '@/lib/supabase/server'
import { isAdmin, isYonetici } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { OdemeBadge } from '@/components/shared/status-badge'
import { OdemeActions } from './odeme-actions'
import type { Profil } from '@/lib/types'

export default async function OdemelerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()

  const yonetici = isYonetici((profil as Profil).rol)
  const admin = isAdmin((profil as Profil).rol)

  let odemeler: any[] = []

  if (yonetici) {
    const { data } = await supabase
      .from('odemeler')
      .select(`
        *,
        profiller(ad, soyad),
        fatura_araziler(tutar, araziler(numara), faturalar(baslik, referans))
      `)
      .order('olusturulma_tarihi', { ascending: false })
    odemeler = data ?? []
  } else {
    const { data } = await supabase
      .from('odemeler')
      .select(`
        *,
        fatura_araziler(tutar, faturalar(baslik, referans))
      `)
      .eq('beyan_eden', user!.id)
      .order('olusturulma_tarihi', { ascending: false })
    odemeler = data ?? []
  }

  return (
    <div>
      <PageHeader title={yonetici ? 'Ödemeler' : 'Ödemelerim'} />

      <div className="px-4 py-3 space-y-2">
        {!odemeler.length ? (
          <p className="text-center text-sm text-gray-400 py-12">Ödeme bulunamadı</p>
        ) : (
          odemeler.map((o: any) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {o.fatura_araziler?.faturalar?.baslik}
                  </p>
                  {yonetici && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Arazi {o.fatura_araziler?.araziler?.numara} · {o.profiller?.ad} {o.profiller?.soyad}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.havale_tarihi).toLocaleDateString('tr-TR')}
                    {o.banka && ` · ${o.banka}`}
                    {o.havale_numarasi && ` · ${o.havale_numarasi}`}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    ₺{Number(o.fatura_araziler?.tutar).toLocaleString('tr-TR')}
                  </p>
                </div>
                <OdemeBadge durum={o.durum} />
              </div>

              {o.arazi_sahibi_notu && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">{o.arazi_sahibi_notu}</p>
              )}

              {o.dekont_url && (
                <a
                  href={o.dekont_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 font-medium"
                >
                  Dekonta bak →
                </a>
              )}

              {o.yonetici_notu && (
                <p className="text-xs text-red-600 bg-red-50 rounded p-2">
                  Yönetici notu: {o.yonetici_notu}
                </p>
              )}

              {admin && o.durum === 'beyan_edildi' && (
                <OdemeActions odemeId={o.id} faturaAraziId={o.fatura_arazi_id} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
