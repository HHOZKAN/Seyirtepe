'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function GirisPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [sifreGoster, setSifreGoster] = useState(false)
  const [hata, setHata] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function girisYap(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !sifre) return

    setYukleniyor(true)
    setHata('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: sifre,
    })

    if (error) {
      // Délai artificiel pour ralentir le brute-force côté client
      await new Promise((r) => setTimeout(r, 500))
      setHata('E-posta veya şifre hatalı.')
      setYukleniyor(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo & titre */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.svg"
            alt="Seyirtepe Kooperatif"
            width={64}
            height={64}
            priority
            className="mb-4 drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Seyirtepe</h1>
          <p className="text-sm text-gray-500 mt-1">Kooperatif Yönetim Sistemi</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={girisYap} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="ornek@mail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sifre">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="sifre"
                  type={sifreGoster ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {sifreGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {hata && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {hata}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl py-2.5"
              disabled={yukleniyor}
            >
              {yukleniyor ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Seyirtepe Kooperatifi
        </p>
      </div>
    </main>
  )
}
