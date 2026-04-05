'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bir hata oluştu</h2>
        <p className="text-sm text-gray-500 mb-6">
          Beklenmedik bir sorun meydana geldi. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={reset}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
        >
          Tekrar Dene
        </button>
      </body>
    </html>
  )
}
