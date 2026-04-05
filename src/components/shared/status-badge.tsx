import { cn } from '@/lib/utils'
import type { FaturaDurumu, OdemeDurumu } from '@/lib/types'

const FATURA_LABELS: Record<FaturaDurumu, string> = {
  taslak: 'Taslak',
  gonderildi: 'Gönderildi',
  kapandi: 'Kapandı',
}

const ODEME_LABELS: Record<OdemeDurumu, string> = {
  beyan_edildi: 'Beyan Edildi',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
}

const FATURA_STYLES: Record<FaturaDurumu, string> = {
  taslak: 'bg-gray-100 text-gray-600',
  gonderildi: 'bg-amber-100 text-amber-700',
  kapandi: 'bg-emerald-100 text-emerald-700',
}

const ODEME_STYLES: Record<OdemeDurumu, string> = {
  beyan_edildi: 'bg-amber-100 text-amber-700',
  onaylandi: 'bg-emerald-100 text-emerald-700',
  reddedildi: 'bg-red-100 text-red-700',
}

export function FaturaBadge({ durum }: { durum: FaturaDurumu }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', FATURA_STYLES[durum])}>
      {FATURA_LABELS[durum]}
    </span>
  )
}

export function OdemeBadge({ durum }: { durum: OdemeDurumu }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ODEME_STYLES[durum])}>
      {ODEME_LABELS[durum]}
    </span>
  )
}

export function OdenmediBadge() {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
      Ödenmedi
    </span>
  )
}
