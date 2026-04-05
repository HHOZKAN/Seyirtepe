export type KullaniciRolu = 'baskan' | 'sayman' | 'sekreter' | 'admin' | 'arazi_sahibi'
export type FaturaDurumu = 'taslak' | 'gonderildi' | 'kapandi'
export type OdemeDurumu = 'beyan_edildi' | 'onaylandi' | 'reddedildi'

export interface Profil {
  id: string
  ad: string
  soyad: string
  email: string
  telefon: string | null
  rol: KullaniciRolu
  arazi_id: string | null
  olusturulma_tarihi: string
}

export interface Arazi {
  id: string
  numara: number
  alan_m2: number
  olusturulma_tarihi: string
}

export interface GiderTipi {
  id: string
  ad: string
  aciklama: string | null
  aktif: boolean
}

export interface Fatura {
  id: string
  referans: string
  gider_tipi_id: string | null
  baslik: string
  aciklama: string | null
  tutar: number
  vade_tarihi: string
  durum: FaturaDurumu
  olusturan: string | null
  olusturulma_tarihi: string
  gider_tipleri?: GiderTipi
}

export interface FaturaArazi {
  id: string
  fatura_id: string
  arazi_id: string
  tutar: number
  odeme_durumu: OdemeDurumu | null
  olusturulma_tarihi: string
  araziler?: Arazi
  faturalar?: Fatura
}

export interface Odeme {
  id: string
  fatura_arazi_id: string
  beyan_eden: string | null
  havale_tarihi: string
  havale_numarasi: string | null
  banka: string | null
  dekont_url: string | null
  arazi_sahibi_notu: string | null
  durum: OdemeDurumu
  onaylayan: string | null
  onay_tarihi: string | null
  yonetici_notu: string | null
  olusturulma_tarihi: string
  profiller?: Profil
  fatura_araziler?: FaturaArazi
}

export function isAdmin(rol: KullaniciRolu): boolean {
  return ['baskan', 'sayman', 'admin'].includes(rol)
}

export function isYonetici(rol: KullaniciRolu): boolean {
  return ['baskan', 'sayman', 'sekreter', 'admin'].includes(rol)
}
