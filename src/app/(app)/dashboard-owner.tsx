import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FaturaBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import type { Profil } from '@/lib/types'

export async function OwnerDashboard({ profil }: { profil: Profil }) {
  const supabase = await createClient()

  const { data: faturaAraziler } = await supabase
    .from('fatura_araziler')
    .select('*, faturalar(baslik, vade_tarihi, durum)')
    .eq('arazi_id', profil.arazi_id!)
    .order('olusturulma_tarihi', { ascending: false })

  const odenmemis = faturaAraziler?.filter(f => f.odeme_durumu !== 'onaylandi') ?? []
  const odenmis = faturaAraziler?.filter(f => f.odeme_durumu === 'onaylandi') ?? []
  const toplamBekleyen = odenmemis.reduce((s, f) => s + f.tutar, 0)
  const toplamOdenen = odenmis.reduce((s, f) => s + f.tutar, 0)

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <p className="text-sm text-gray-500">Merhaba,</p>
        <h2 className="text-xl font-bold text-gray-900">{profil.ad} {profil.soyad}</h2>
        {profil.arazi_id && (
          <p className="text-sm text-gray-500 mt-0.5">Arazi sahibi</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-500 rounded-xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">Ödenmemiş</p>
          <p className="text-2xl font-bold">₺{toplamBekleyen.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-emerald-500 rounded-xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">Ödenen</p>
          <p className="text-2xl font-bold">₺{toplamOdenen.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      <Link href="/faturalar">
        <Button className="w-full" size="lg">
          + Ödeme Beyan Et
        </Button>
      </Link>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Faturalarım</h3>
        {!faturaAraziler?.length ? (
          <p className="text-sm text-gray-400 py-4 text-center">Henüz fatura yok</p>
        ) : (
          <div className="space-y-2">
            {faturaAraziler.map((fa: any) => (
              <Link
                key={fa.id}
                href={`/faturalar/${fa.fatura_id}`}
                className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{fa.faturalar?.baslik}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ₺{fa.tutar.toLocaleString('tr-TR')} · {new Date(fa.faturalar?.vade_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <FaturaBadge durum={fa.faturalar?.durum} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
