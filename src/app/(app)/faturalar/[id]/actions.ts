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
