import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import type { Profil } from '@/lib/types'

export default async function ArazilerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()
  if (!isAdmin((profil as Profil).rol)) redirect('/')

  const { data: araziler } = await supabase
    .from('araziler')
    .select('*, profiller(ad, soyad)')
    .order('numara')

  return (
    <div>
      <PageHeader title="Araziler" backHref="/profil" />
      <div className="px-4 py-4">
        <p className="text-sm text-gray-500 mb-4">{araziler?.length ?? 0} arazi</p>
        <div className="grid grid-cols-2 gap-2">
          {(araziler ?? []).map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold text-gray-900">#{a.numara}</span>
                <span className="text-xs text-gray-400">{a.alan_m2} m²</span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {a.profiller ? `${a.profiller.ad} ${a.profiller.soyad}` : (
                  <span className="text-gray-300">Atanmamış</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
