'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function GirisPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function girisYap(e: React.FormEvent) {
    e.preventDefault()
    setYukleniyor(true)
    setHata('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })

    if (error) {
      setHata('E-posta veya şifre hatalı.')
      setYukleniyor(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Seyirtepe</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Kooperatif Yönetim Sistemi</p>

        <form onSubmit={girisYap} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="ornek@mail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="sifre">
              Şifre
            </label>
            <input
              id="sifre"
              type="password"
              required
              value={sifre}
              onChange={e => setSifre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          {hata && <p className="text-sm text-red-600">{hata}</p>}

          <Button type="submit" className="w-full" disabled={yukleniyor}>
            {yukleniyor ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </Button>
        </form>
      </div>
    </main>
  )
}
