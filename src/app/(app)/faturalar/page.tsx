import { createClient } from '@/lib/supabase/server'
import { isYonetici } from '@/lib/types'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FaturaBadge, OdemeBadge, OdenmediBadge } from '@/components/shared/status-badge'
import type { Profil, Fatura, FaturaArazi, FaturaDurumu } from '@/lib/types'

const DURUMLAR: { key: FaturaDurumu | 'hepsi'; label: string }[] = [
  { key: 'hepsi', label: 'Hepsi' },
  { key: 'taslak', label: 'Taslak' },
  { key: 'gonderildi', label: 'Gönderildi' },
  { key: 'kapandi', label: 'Kapandı' },
]

export default async function FaturalarPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>
}) {
  const { durum } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profiller')
    .select('*')
    .eq('id', user!.id)
    .single()

  const yonetici = isYonetici((profil as Profil).rol)

  let faturalar: any[] = []

  if (yonetici) {
    let q = supabase
      .from('faturalar')
      .select('*, gider_tipleri(ad)')
      .order('olusturulma_tarihi', { ascending: false })

    if (durum && durum !== 'hepsi') {
      q = q.eq('durum', durum)
    }

    const { data } = await q
    faturalar = data ?? []
  } else {
    const { data: faturaAraziler } = await supabase
      .from('fatura_araziler')
      .select('*, faturalar(*, gider_tipleri(ad))')
      .eq('arazi_id', (profil as Profil).arazi_id!)
      .order('olusturulma_tarihi', { ascending: false })

    faturalar = (faturaAraziler ?? []).map((fa: any) => ({
      ...fa.faturalar,
      _fa: fa,
    }))
  }

  const aktifDurum = durum ?? 'hepsi'

  return (
    <div>
      <PageHeader
        title={yonetici ? 'Faturalar' : 'Faturalarım'}
        action={
          yonetici ? (
            <Link
              href="/faturalar/yeni"
              className="flex items-center gap-1 bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Yeni
            </Link>
          ) : undefined
        }
      />

      {yonetici && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {DURUMLAR.map(d => (
            <Link
              key={d.key}
              href={d.key === 'hepsi' ? '/faturalar' : `/faturalar?durum=${d.key}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                aktifDurum === d.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>
      )}

      <div className="px-4 py-2 space-y-2">
        {!faturalar.length ? (
          <p className="text-center text-sm text-gray-400 py-12">Fatura bulunamadı</p>
        ) : (
          faturalar.map((f: any) => (
            <Link
              key={f.id}
              href={`/faturalar/${f.id}`}
              className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{f.baslik}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {f.referans} · {new Date(f.vade_tarihi).toLocaleDateString('tr-TR')}
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  ₺{Number(f.tutar).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="ml-3 shrink-0">
                {yonetici ? (
                  <FaturaBadge durum={f.durum} />
                ) : f._fa?.odeme_durumu ? (
                  <OdemeBadge durum={f._fa.odeme_durumu} />
                ) : (
                  <OdenmediBadge />
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
