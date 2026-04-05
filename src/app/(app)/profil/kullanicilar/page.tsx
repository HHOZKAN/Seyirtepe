import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { KullanicilarClient } from './kullanicilar-client'
import type { Profil } from '@/lib/types'

export default async function KullanicilarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()
  if (!isAdmin((profil as Profil).rol)) redirect('/')

  const [{ data: kullanicilar }, { data: araziler }] = await Promise.all([
    supabase.from('profiller').select('*, araziler(numara)').order('soyad'),
    supabase.from('araziler').select('*, profiller(id, ad, soyad)').order('numara'),
  ])

  return (
    <div>
      <PageHeader title="Kullanıcılar" backHref="/profil" />
      <div className="px-4 py-4">
        <p className="text-sm text-gray-500 mb-4">{kullanicilar?.length ?? 0} kullanıcı</p>
        <KullanicilarClient kullanicilar={kullanicilar ?? []} araziler={araziler ?? []} />
      </div>
    </div>
  )
}
