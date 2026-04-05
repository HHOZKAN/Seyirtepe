import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <Image src="/logo.svg" alt="Seyirtepe" width={48} height={48} className="mb-6 opacity-50" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Aradığınız sayfa bulunamadı.</p>
      <Link
        href="/"
        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
      >
        Ana Sayfaya Dön
      </Link>
    </main>
  )
}
