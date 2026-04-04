# Seyirtepe — Pages Design Spec
Date: 2026-04-04

## Context

Mobile-first Turkish web app for cooperative land billing management.
Stack: Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Supabase.
Already done: `/giris` login page, Supabase client/server setup, proxy auth.

## Design Decisions

| Decision | Choice |
|---|---|
| Navigation | Bottom tab bar (4 tabs) |
| Admin tabs | Ana · Faturalar · Ödemeler · Profil |
| Owner tabs | Ana · Faturalarım · Ödemelerim · Profil |
| Admin dashboard | 4 stat cards + recent activity list |
| Owner dashboard | Red/green balance cards + "Ödeme Beyan Et" CTA |
| Primary color | Emerald green |

## Roles

- **baskan / sayman / admin** → full management access: create invoices, approve/reject payments
- **sekreter** → read-only access: can view all data but cannot create invoices, approve/reject payments, or edit users
- **arazi_sahibi** → sees only own data

## Architecture

### Route Structure

```
src/app/
├── (auth)/
│   └── giris/page.tsx              ✅ done
├── (app)/
│   ├── layout.tsx                  ← bottom nav + header, auth guard
│   ├── page.tsx                    ← dashboard (role-based)
│   ├── faturalar/
│   │   ├── page.tsx                ← invoice list
│   │   ├── yeni/page.tsx           ← create invoice (admin only)
│   │   └── [id]/page.tsx           ← invoice detail + linked payments
│   ├── odemeler/
│   │   └── page.tsx                ← payments list
│   └── profil/
│       ├── page.tsx                ← personal profile + logout
│       ├── araziler/page.tsx       ← 40 plots grid (admin only)
│       └── kullanicilar/page.tsx   ← user list (admin only)
└── layout.tsx                      ← root layout
```

### Shared Components

- `BottomNav` — 4 adaptive tabs based on role
- `PageHeader` — title + back button
- `StatusBadge` — fatura: taslak/gonderildi/kapandi · odeme: beyan_edildi/onaylandi/reddedildi
- `hooks/useRole` — reads role from Supabase profile via Context
- `hooks/useProfil` — reads current user's profile

## Pages

### Dashboard `/`

**Admin:**
- 4 stat cards: açık fatura count, onay bekleyen count, tahsil edilen ₺, bekleyen ₺
- List of latest `beyan_edildi` payments with direct link to approve

**Owner (arazi_sahibi):**
- Red card: total ₺ owed (unpaid invoices)
- Green card: total ₺ paid
- Large CTA button: "Ödeme Beyan Et" → links to `/faturalar` (owner sees their open invoices to pick one)
- List of own open invoices

### Invoice List `/faturalar`

**Admin:**
- Full list of all invoices
- Filter tabs by `durum`: taslak / gonderildi / kapandi
- "+ Yeni Fatura" button (top right)
- Each row: referans, baslik, tutar, vade_tarihi, durum badge

**Owner:**
- Only invoices linked to their arazi (via `fatura_araziler`)
- No create button
- Each row shows their personal payment status (odeme_durumu)

### Create Invoice `/faturalar/yeni` *(admin only)*

Form fields:
- `gider_tipi_id` — select from gider_tipleri
- `baslik` — text input
- `aciklama` — optional textarea
- `tutar` — number input (total amount)
- `vade_tarihi` — date picker
- Arazi selection — checkboxes for all 40 plots; amount auto-split equally

Actions:
- "Kaydet" → saves as `taslak`
- "Gönder" → saves and sets status to `gonderildi`, creates `fatura_araziler` rows

### Invoice Detail `/faturalar/[id]`

Header: referans, baslik, gider tipi, tutar, vade tarihi, durum badge

**Admin:**
- Status change buttons (taslak→gonderildi→kapandi)
- Table of all `fatura_araziler` rows: arazi no, owner name, tutar, odeme_durumu
- Click row → see linked odeme details

**Owner:**
- Only sees their own `fatura_araziler` row
- "Ödeme Beyan Et" button if odeme_durumu is null

### Payments List `/odemeler`

**Admin:**
- List all `odemeler` with status filter
- Each row: arazi no, owner name, havale_tarihi, banka, tutar, durum
- "Onayla" ✓ and "Reddet" ✗ inline action buttons for `beyan_edildi` items
- Reject: optional yonetici_notu textarea

**Owner:**
- Own payment declarations only
- Shows status (beyan_edildi / onaylandi / reddedildi)
- Red badge with yonetici_notu if rejected

### Declare Payment *(sheet/modal on faturalar/[id])*

Form fields:
- `havale_tarihi` — date picker
- `havale_numarasi` — text
- `banka` — text
- `arazi_sahibi_notu` — optional textarea
- `dekont_url` — photo upload to Supabase Storage bucket `dekontlar`

### Profile `/profil`

- Display: ad, soyad, email, telefon, arazi numarası, rol
- Edit: telefon only (owners); full edit for admin
- Admin-only links: "Araziler" and "Kullanıcılar"
- "Çıkış Yap" logout button

### Plots `/profil/araziler` *(admin only)*

- Grid of all 40 plots
- Each cell: numara, assigned owner name (or "Atanmamış"), global payment status indicator

### Users `/profil/kullanicilar` *(admin only)*

- List of all profiller
- Columns: ad soyad, email, rol badge, arazi no
- Edit button → inline or sheet: change rol, assign arazi_id

## Data Flow

**Reading:** Server Components by default. Data fetched server-side via `createClient()` (server). Supabase RLS handles filtering automatically.

**Mutations:** Next.js Server Actions (`'use server'`). No separate API routes.

**Role propagation:** `getRoleServer()` reads `profiller.rol` once in `(app)/layout.tsx`, passed to client via Context.

**File upload:** Supabase Storage bucket `dekontlar` (public read, authenticated write). URL stored in `odemeler.dekont_url`.

## Error Handling

- Unauthorized access → redirect to `/` with Turkish error toast
- Form validation errors → inline under each field
- Supabase errors → global toast "Bir hata oluştu, tekrar deneyin"
- Not found → Turkish `not-found.tsx`
- Loading states → shadcn `Skeleton` components (no global spinner)

## Color Theme

Primary color: emerald green (`#059669` / Tailwind `emerald-600`).
Applied via CSS variables in `globals.css` overriding shadcn defaults.
Status colors:
- `taslak` → gray
- `gonderildi` → amber
- `kapandi` → emerald
- `beyan_edildi` → amber
- `onaylandi` → emerald
- `reddedildi` → red
