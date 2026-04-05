import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { OdemeBadge } from '@/components/shared/status-badge'
import type { Odeme } from '@/lib/types'

export async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: acikFatura },
    { count: onayBekleyen },
    { data: odemeler },
  ] = await Promise.all([
    supabase.from('faturalar').select('*', { count: 'exact', head: true }).neq('durum', 'kapandi'),
    supabase.from('odemeler').select('*', { count: 'exact', head: true }).eq('durum', 'beyan_edildi'),
    supabase
      .from('odemeler')
      .select('*, fatura_araziler(tutar, araziler(numara), faturalar(baslik))')
      .eq('durum', 'beyan_edildi')
      .order('olusturulma_tarihi', { ascending: false })
      .limit(5),
  ])

  const { data: tahsilData } = await supabase
    .from('fatura_araziler')
    .select('tutar, odeme_durumu')

  const tahsilEdilen = tahsilData?.filter(r => r.odeme_durumu === 'onaylandi').reduce((s, r) => s + r.tutar, 0) ?? 0
  const bekleyen = tahsilData?.filter(r => r.odeme_durumu !== 'onaylandi').reduce((s, r) => s + r.tutar, 0) ?? 0

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Genel Bakış</h2>
        <p className="text-sm text-gray-500">Kooperatif özeti</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Açık Fatura" value={acikFatura ?? 0} unit="adet" />
        <StatCard label="Onay Bekleyen" value={onayBekleyen ?? 0} unit="ödeme" highlight="amber" />
        <StatCard label="Tahsil Edilen" value={`₺${tahsilEdilen.toLocaleString('tr-TR')}`} highlight="emerald" />
        <StatCard label="Bekleyen" value={`₺${bekleyen.toLocaleString('tr-TR')}`} highlight="red" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Son Ödemeler</h3>
          <Link href="/odemeler" className="text-sm text-emerald-600 font-medium">Tümü →</Link>
        </div>
        {!odemeler?.length ? (
          <p className="text-sm text-gray-400 py-4 text-center">Bekleyen ödeme yok</p>
        ) : (
          <div className="space-y-2">
            {odemeler.map((o: any) => (
              <Link
                key={o.id}
                href="/odemeler"
                className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Arazi {o.fatura_araziler?.araziler?.numara} · ₺{o.fatura_araziler?.tutar?.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.fatura_araziler?.faturalar?.baslik}</p>
                </div>
                <OdemeBadge durum={o.durum} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, highlight }: {
  label: string
  value: string | number
  unit?: string
  highlight?: 'amber' | 'emerald' | 'red'
}) {
  const colors = {
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    red: 'text-red-500',
  }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? colors[highlight] : 'text-gray-900'}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}
