'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function OdemeBeyanSheet({ faturaAraziId, faturaBaslik }: { faturaAraziId: string; faturaBaslik: string }) {
  const router = useRouter()
  const [acik, setAcik] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [form, setForm] = useState({
    havale_tarihi: '',
    havale_numarasi: '',
    banka: '',
    arazi_sahibi_notu: '',
  })
  const [dekont, setDekont] = useState<File | null>(null)

  async function beyanEt() {
    if (!form.havale_tarihi) { setHata('Havale tarihi zorunludur.'); return }
    setHata('')
    setYukleniyor(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let dekont_url: string | null = null
    if (dekont) {
      const ext = dekont.name.split('.').pop()
      const path = `${user!.id}/${faturaAraziId}.${ext}`
      const { data: upload } = await supabase.storage.from('dekontlar').upload(path, dekont, { upsert: true })
      if (upload) {
        const { data: url } = supabase.storage.from('dekontlar').getPublicUrl(upload.path)
        dekont_url = url.publicUrl
      }
    }

    const { error } = await supabase.from('odemeler').insert({
      fatura_arazi_id: faturaAraziId,
      beyan_eden: user!.id,
      havale_tarihi: form.havale_tarihi,
      havale_numarasi: form.havale_numarasi || null,
      banka: form.banka || null,
      arazi_sahibi_notu: form.arazi_sahibi_notu || null,
      dekont_url,
      durum: 'beyan_edildi',
    })

    if (error) {
      setHata('Bir hata oluştu, tekrar deneyin.')
      setYukleniyor(false)
      return
    }

    await supabase
      .from('fatura_araziler')
      .update({ odeme_durumu: 'beyan_edildi' })
      .eq('id', faturaAraziId)

    setAcik(false)
    router.refresh()
  }

  if (!acik) {
    return (
      <Button className="w-full" onClick={() => setAcik(true)}>
        + Ödeme Beyan Et
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Ödeme Beyanı</h3>
      <p className="text-sm text-gray-500">{faturaBaslik}</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Havale Tarihi *</label>
        <input
          type="date"
          value={form.havale_tarihi}
          onChange={e => setForm(f => ({ ...f, havale_tarihi: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Havale No</label>
          <input
            type="text"
            value={form.havale_numarasi}
            onChange={e => setForm(f => ({ ...f, havale_numarasi: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="İsteğe bağlı"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banka</label>
          <input
            type="text"
            value={form.banka}
            onChange={e => setForm(f => ({ ...f, banka: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ziraat, Halk..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notunuz</label>
        <textarea
          value={form.arazi_sahibi_notu}
          onChange={e => setForm(f => ({ ...f, arazi_sahibi_notu: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={2}
          placeholder="İsteğe bağlı"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dekont (fotoğraf)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setDekont(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700"
        />
      </div>

      {hata && <p className="text-sm text-red-600">{hata}</p>}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setAcik(false)} disabled={yukleniyor}>
          İptal
        </Button>
        <Button className="flex-1" onClick={beyanEt} disabled={yukleniyor}>
          {yukleniyor ? 'Gönderiliyor...' : 'Beyan Et'}
        </Button>
      </div>
    </div>
  )
}
