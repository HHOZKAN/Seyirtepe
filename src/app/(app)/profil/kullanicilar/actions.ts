'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import type { KullaniciRolu, Profil } from '@/lib/types'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Yetkisiz')
  const { data: profil } = await supabase.from('profiller').select('rol').eq('id', user.id).single()
  if (!profil || !isAdmin((profil as Profil).rol)) throw new Error('Yetkisiz')
  return supabase
}

export async function kullaniciGuncelle(
  kullaniciId: string,
  rol: KullaniciRolu,
  araziId: string | null
) {
  await checkAdmin()
  const admin = createAdminClient()

  await admin
    .from('profiller')
    .update({ rol, arazi_id: araziId })
    .eq('id', kullaniciId)

  revalidatePath('/profil/kullanicilar')
}

export async function kullaniciDavetEt(
  email: string,
  ad: string,
  soyad: string,
  rol: KullaniciRolu,
  araziId: string | null
) {
  await checkAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { ad, soyad, rol },
  })

  if (error) throw new Error(error.message)

  if (araziId && data.user) {
    await admin
      .from('profiller')
      .update({ arazi_id: araziId, ad, soyad, rol })
      .eq('id', data.user.id)
  }

  revalidatePath('/profil/kullanicilar')
}
