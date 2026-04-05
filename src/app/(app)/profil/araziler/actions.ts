'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import type { Profil } from '@/lib/types'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Yetkisiz')
  const { data: profil } = await supabase.from('profiller').select('rol').eq('id', user.id).single()
  if (!profil || !isAdmin((profil as Profil).rol)) throw new Error('Yetkisiz')
}

export async function araziSahibiGuncelle(araziId: string, yeniSahibiId: string | null) {
  await checkAdmin()
  const admin = createAdminClient()

  // Mevcut sahibin arazi_id'sini temizle
  await admin.from('profiller').update({ arazi_id: null }).eq('arazi_id', araziId)

  // Yeni sahibi ata
  if (yeniSahibiId) {
    await admin.from('profiller').update({ arazi_id: araziId }).eq('id', yeniSahibiId)
  }

  revalidatePath('/profil/araziler')
}
