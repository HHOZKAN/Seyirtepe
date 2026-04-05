'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, CreditCard, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfil } from '@/context/profil-context'
import { isYonetici } from '@/lib/types'

export function BottomNav() {
  const pathname = usePathname()
  const profil = useProfil()
  const yonetici = isYonetici(profil.rol)

  const tabs = yonetici
    ? [
        { href: '/', label: 'Ana', icon: Home },
        { href: '/faturalar', label: 'Faturalar', icon: FileText },
        { href: '/odemeler', label: 'Ödemeler', icon: CreditCard },
        { href: '/profil', label: 'Profil', icon: User },
      ]
    : [
        { href: '/', label: 'Ana', icon: Home },
        { href: '/faturalar', label: 'Faturalarım', icon: FileText },
        { href: '/odemeler', label: 'Ödemelerim', icon: CreditCard },
        { href: '/profil', label: 'Profil', icon: User },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 pb-safe">
      <div className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
