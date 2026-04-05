import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import type { Profil } from '@/lib/types'

const ROL_LABELS: Record<string, string> = {
  baskan: 'Başkan',
  sayman: 'Sayman',
  sekreter: 'Sekreter',
  admin: 'Admin',
  arazi_sahibi: 'Arazi Sahibi',
}

const ROL_COLORS: Record<string, string> = {
  baskan: 'bg-emerald-100 text-emerald-700',
  sayman: 'bg-blue-100 text-blue-700',
  sekreter: 'bg-gray-100 text-gray-600',
  admin: 'bg-purple-100 text-purple-700',
  arazi_sahibi: 'bg-amber-100 text-amber-700',
}

export default async function KullanicilarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()
  if (!isAdmin((profil as Profil).rol)) redirect('/')

  const { data: kullanicilar } = await supabase
    .from('profiller')
    .select('*, araziler(numara)')
    .order('soyad')

  return (
    <div>
      <PageHeader title="Kullanıcılar" backHref="/profil" />
      <div className="px-4 py-4 space-y-2">
        <p className="text-sm text-gray-500 mb-4">{kullanicilar?.length ?? 0} kullanıcı</p>
        {(kullanicilar ?? []).map((k: any) => (
          <div key={k.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{k.ad} {k.soyad}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{k.email}</p>
                {k.telefon && <p className="text-xs text-gray-400 mt-0.5">{k.telefon}</p>}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROL_COLORS[k.rol]}`}>
                  {ROL_LABELS[k.rol]}
                </span>
                {k.araziler && (
                  <span className="text-xs text-gray-400">Arazi #{k.araziler.numara}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
