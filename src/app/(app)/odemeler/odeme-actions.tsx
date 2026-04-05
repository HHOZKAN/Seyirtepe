'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function OdemeActions({ odemeId, faturaAraziId }: { odemeId: string; faturaAraziId: string }) {
  const router = useRouter()
  const [redMode, setRedMode] = useState(false)
  const [not, setNot] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function onayla() {
    setYukleniyor(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('odemeler').update({
      durum: 'onaylandi',
      onaylayan: user!.id,
      onay_tarihi: new Date().toISOString(),
    }).eq('id', odemeId)
    await supabase.from('fatura_araziler').update({ odeme_durumu: 'onaylandi' }).eq('id', faturaAraziId)
    router.refresh()
  }

  async function reddet() {
    setYukleniyor(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('odemeler').update({
      durum: 'reddedildi',
      onaylayan: user!.id,
      onay_tarihi: new Date().toISOString(),
      yonetici_notu: not || null,
    }).eq('id', odemeId)
    await supabase.from('fatura_araziler').update({ odeme_durumu: 'reddedildi' }).eq('id', faturaAraziId)
    router.refresh()
  }

  if (redMode) {
    return (
      <div className="space-y-2">
        <textarea
          value={not}
          onChange={e => setNot(e.target.value)}
          placeholder="Red nedeni (isteğe bağlı)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          rows={2}
        />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setRedMode(false)} disabled={yukleniyor}>
            İptal
          </Button>
          <Button variant="destructive" className="flex-1" onClick={reddet} disabled={yukleniyor}>
            Reddet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setRedMode(true)} disabled={yukleniyor}>
        Reddet
      </Button>
      <Button className="flex-1" onClick={onayla} disabled={yukleniyor}>
        Onayla ✓
      </Button>
    </div>
  )
}
