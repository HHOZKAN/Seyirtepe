'use server'

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
  return supabase
}

export async function faturaArazilerGuncelle(
  faturaId: string,
  faturaToplamTutar: number,
  yeniAraziIdler: string[]
) {
  const supabase = await checkAdmin()

  // Mevcut fatura_araziler kayıtları
  const { data: mevcutlar } = await supabase
    .from('fatura_araziler')
    .select('id, arazi_id, odeme_durumu')
    .eq('fatura_id', faturaId)

  const mevcutIdler = (mevcutlar ?? []).map((m: any) => m.arazi_id)

  // Eklenecekler
  const eklenecekler = yeniAraziIdler.filter((id) => !mevcutIdler.includes(id))

  // Silinecekler — sadece ödeme beyan edilmemişler
  const silinecekler = (mevcutlar ?? []).filter(
    (m: any) => !yeniAraziIdler.includes(m.arazi_id) && !m.odeme_durumu
  )

  // Yeni tutar payı
  const payTutar =
    yeniAraziIdler.length > 0
      ? Math.round((faturaToplamTutar / yeniAraziIdler.length) * 100) / 100
      : 0

  // Sil
  if (silinecekler.length > 0) {
    await supabase
      .from('fatura_araziler')
      .delete()
      .in('id', silinecekler.map((m: any) => m.id))
  }

  // Ekle
  if (eklenecekler.length > 0) {
    await supabase.from('fatura_araziler').insert(
      eklenecekler.map((arazi_id) => ({
        fatura_id: faturaId,
        arazi_id,
        tutar: payTutar,
      }))
    )
  }

  // Kalan kayıtların tutarını güncelle
  const kalanIdler = (mevcutlar ?? [])
    .filter((m: any) => yeniAraziIdler.includes(m.arazi_id))
    .map((m: any) => m.id)

  if (kalanIdler.length > 0) {
    await supabase
      .from('fatura_araziler')
      .update({ tutar: payTutar })
      .in('id', kalanIdler)
  }

  revalidatePath(`/faturalar/${faturaId}`)
}

export async function faturaGuncelle(
  faturaId: string,
  data: {
    baslik: string
    aciklama: string | null
    tutar: number
    vade_tarihi: string
    gider_tipi_id: string | null
  }
) {
  const supabase = await checkAdmin()

  const { error } = await supabase
    .from('faturalar')
    .update(data)
    .eq('id', faturaId)

  if (error) throw new Error(error.message)

  revalidatePath(`/faturalar/${faturaId}`)
  revalidatePath('/faturalar')
}
