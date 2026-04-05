import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { YeniFaturaForm } from './yeni-fatura-form'
import type { Profil, GiderTipi, Arazi } from '@/lib/types'

export default async function YeniFaturaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase.from('profiller').select('*').eq('id', user!.id).single()
  if (!isAdmin((profil as Profil).rol)) redirect('/')

  const [{ data: giderTipleri }, { data: araziler }] = await Promise.all([
    supabase.from('gider_tipleri').select('*').eq('aktif', true).order('ad'),
    supabase.from('araziler').select('*, profiller(ad, soyad)').order('numara'),
  ])

  return (
    <div>
      <PageHeader title="Yeni Fatura" backHref="/faturalar" />
      <YeniFaturaForm
        giderTipleri={(giderTipleri ?? []) as GiderTipi[]}
        araziler={araziler ?? []}
        olusturanId={user!.id}
      />
    </div>
  )
}
