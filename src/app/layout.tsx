import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Seyirtepe Kooperatif',
    template: '%s — Seyirtepe',
  },
  description: 'Seyirtepe Kooperatifi arazi ve aidat yönetim sistemi.',
  applicationName: 'Seyirtepe Kooperatif',
  authors: [{ name: 'Seyirtepe Kooperatifi' }],
  keywords: ['kooperatif', 'arazi', 'aidat', 'yönetim'],
  robots: { index: false, follow: false },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  )
}
