import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { ArazilerClient } from './araziler-client'
import type { Profil } from '@/lib/types'

export default async function ArazilerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()
  if (!isAdmin((profil as Profil).rol)) redirect('/')

  const [{ data: araziler }, { data: profiller }] = await Promise.all([
    supabase.from('araziler').select('*, profiller(id, ad, soyad)').order('numara'),
    supabase.from('profiller').select('id, ad, soyad, arazi_id').order('ad'),
  ])

  return (
    <div>
      <PageHeader title="Araziler" backHref="/profil" />
      <div className="px-4 py-4">
        <ArazilerClient
          araziler={(araziler ?? []) as any}
          profiller={(profiller ?? []) as any}
        />
      </div>
    </div>
  )
}
