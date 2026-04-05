import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilProvider } from '@/context/profil-context'
import { BottomNav } from '@/components/shared/bottom-nav'
import type { Profil } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/giris')

  const { data: profil } = await supabase
    .from('profiller')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profil) redirect('/giris')

  return (
    <ProfilProvider profil={profil as Profil}>
      <div className="min-h-screen bg-gray-50 pb-20">
        {children}
      </div>
      <BottomNav />
    </ProfilProvider>
  )
}
