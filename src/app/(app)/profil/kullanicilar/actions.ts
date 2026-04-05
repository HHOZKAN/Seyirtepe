'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/types'
import { assertInput, sanitize, validEmail, validRole, validUUID } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import type { KullaniciRolu, Profil } from '@/lib/types'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Yetkisiz erişim.')
  const { data: profil } = await supabase.from('profiller').select('rol').eq('id', user.id).single()
  if (!profil || !isAdmin((profil as Profil).rol)) throw new Error('Yetkisiz erişim.')
  return supabase
}

export async function kullaniciSifreGuncelle(kullaniciId: string, yeniSifre: string) {
  await checkAdmin()

  assertInput(validUUID(kullaniciId), 'Geçersiz kullanıcı.')
  assertInput(yeniSifre.length >= 8, 'Şifre en az 8 karakter olmalıdır.')
  assertInput(yeniSifre.length <= 128, 'Şifre çok uzun.')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(kullaniciId, {
    password: yeniSifre,
  })

  if (error) throw new Error('Şifre güncellenirken bir hata oluştu.')
}

export async function kullaniciGuncelle(
  kullaniciId: string,
  rol: KullaniciRolu,
  araziId: string | null
) {
  await checkAdmin()

  assertInput(validUUID(kullaniciId), 'Geçersiz kullanıcı.')
  assertInput(validRole(rol), 'Geçersiz rol.')
  assertInput(!araziId || validUUID(araziId), 'Geçersiz arazi.')

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiller')
    .update({ rol, arazi_id: araziId })
    .eq('id', kullaniciId)

  if (error) throw new Error('Kullanıcı güncellenirken bir hata oluştu.')

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

  const cleanEmail = sanitize(email, 254).toLowerCase()
  const cleanAd = sanitize(ad, 100)
  const cleanSoyad = sanitize(soyad, 100)

  assertInput(validEmail(cleanEmail), 'Geçerli bir e-posta adresi giriniz.')
  assertInput(cleanAd.length >= 1, 'Ad boş olamaz.')
  assertInput(cleanSoyad.length >= 1, 'Soyad boş olamaz.')
  assertInput(validRole(rol), 'Geçersiz rol.')
  assertInput(!araziId || validUUID(araziId), 'Geçersiz arazi.')

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.inviteUserByEmail(cleanEmail, {
    data: { ad: cleanAd, soyad: cleanSoyad, rol },
  })

  if (error) throw new Error('Davet gönderilemedi. E-posta zaten kayıtlı olabilir.')

  if (data.user) {
    await admin
      .from('profiller')
      .update({ arazi_id: araziId, ad: cleanAd, soyad: cleanSoyad, rol })
      .eq('id', data.user.id)
  }

  revalidatePath('/profil/kullanicilar')
}
