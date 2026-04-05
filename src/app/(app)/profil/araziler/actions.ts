'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/types'
import { assertInput, validUUID } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import type { Profil } from '@/lib/types'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Yetkisiz erişim.')
  const { data: profil } = await supabase.from('profiller').select('rol').eq('id', user.id).single()
  if (!profil || !isAdmin((profil as Profil).rol)) throw new Error('Yetkisiz erişim.')
}

export async function araziSahibiGuncelle(araziId: string, yeniSahibiId: string | null) {
  await checkAdmin()

  assertInput(validUUID(araziId), 'Geçersiz arazi.')
  assertInput(!yeniSahibiId || validUUID(yeniSahibiId), 'Geçersiz kullanıcı.')

  const admin = createAdminClient()

  // Mevcut sahibin arazi_id'sini temizle
  const { error: clearError } = await admin
    .from('profiller')
    .update({ arazi_id: null })
    .eq('arazi_id', araziId)

  if (clearError) throw new Error('Arazi güncellenirken bir hata oluştu.')

  // Yeni sahibi ata
  if (yeniSahibiId) {
    const { error: setError } = await admin
      .from('profiller')
      .update({ arazi_id: araziId })
      .eq('id', yeniSahibiId)

    if (setError) throw new Error('Arazi güncellenirken bir hata oluştu.')
  }

  revalidatePath('/profil/araziler')
  revalidatePath('/profil/kullanicilar')
}
