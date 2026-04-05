import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { CikisButonu } from './cikis-butonu'
import { ChevronRight, Map, Users } from 'lucide-react'
import Link from 'next/link'
import type { Profil } from '@/lib/types'

const ROL_LABELS: Record<string, string> = {
  baskan: 'Başkan',
  sayman: 'Sayman',
  sekreter: 'Sekreter',
  admin: 'Admin',
  arazi_sahibi: 'Arazi Sahibi',
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profil } = await supabase
    .from('profiller')
    .select('*, araziler(numara)')
    .eq('id', user!.id)
    .single()

  const admin = isAdmin((profil as Profil).rol)

  return (
    <div>
      <PageHeader title="Profil" />

      <div className="px-4 py-5 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
              {(profil as any).ad?.[0]}{(profil as any).soyad?.[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{(profil as any).ad} {(profil as any).soyad}</p>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                {ROL_LABELS[(profil as Profil).rol]}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            <InfoRow label="E-posta" value={(profil as any).email} />
            {(profil as any).telefon && <InfoRow label="Telefon" value={(profil as any).telefon} />}
            {(profil as any).araziler && (
              <InfoRow label="Arazi No" value={`${(profil as any).araziler.numara}`} />
            )}
          </div>
        </div>

        {admin && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Link href="/profil/araziler" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-900">Araziler</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <div className="border-t border-gray-50" />
            <Link href="/profil/kullanicilar" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-900">Kullanıcılar</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        )}

        <CikisButonu />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5 flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}
