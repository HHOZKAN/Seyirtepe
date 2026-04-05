'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { FaturaDurumu } from '@/lib/types'

const SONRAKI: Partial<Record<FaturaDurumu, { durum: FaturaDurumu; label: string }>> = {
  taslak: { durum: 'gonderildi', label: 'Gönder' },
  gonderildi: { durum: 'kapandi', label: 'Kapat' },
}

export function FaturaDurumActions({ faturaId, mevcutDurum }: { faturaId: string; mevcutDurum: FaturaDurumu }) {
  const router = useRouter()
  const sonraki = SONRAKI[mevcutDurum]
  if (!sonraki) return null

  async function guncelle() {
    const supabase = createClient()
    await supabase.from('faturalar').update({ durum: sonraki!.durum }).eq('id', faturaId)
    router.refresh()
  }

  return (
    <Button onClick={guncelle} className="w-full">
      {sonraki.label}
    </Button>
  )
}
