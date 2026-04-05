'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AppError]', error)
  }, [error])

  return (
    <div>
      <PageHeader title="Hata" />
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Bir hata oluştu</h2>
        <p className="text-sm text-gray-500 mb-6">
          Bu sayfa yüklenirken beklenmedik bir sorun oluştu.
        </p>
        <button
          onClick={reset}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}
