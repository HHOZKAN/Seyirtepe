'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function CikisButonu() {
  const router = useRouter()

  async function cikisYap() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/giris')
    router.refresh()
  }

  return (
    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={cikisYap}>
      Çıkış Yap
    </Button>
  )
}
