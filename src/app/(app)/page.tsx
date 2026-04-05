import { createClient } from '@/lib/supabase/server'
import { isYonetici } from '@/lib/types'
import { AdminDashboard } from './dashboard-admin'
import { OwnerDashboard } from './dashboard-owner'
import type { Profil } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profiller')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (isYonetici((profil as Profil).rol)) {
    return <AdminDashboard />
  }

  return <OwnerDashboard profil={profil as Profil} />
}
