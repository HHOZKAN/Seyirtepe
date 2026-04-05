'use client'

import { useState } from 'react'
import { Pencil, UserPlus, X } from 'lucide-react'
import { KullaniciEditForm } from './kullanici-edit-form'
import { DavetForm } from './davet-form'

const ROL_LABELS: Record<string, string> = {
  baskan: 'Başkan', sayman: 'Sayman', sekreter: 'Sekreter',
  admin: 'Admin', arazi_sahibi: 'Arazi Sahibi',
}
const ROL_COLORS: Record<string, string> = {
  baskan: 'bg-emerald-100 text-emerald-700',
  sayman: 'bg-blue-100 text-blue-700',
  sekreter: 'bg-gray-100 text-gray-600',
  admin: 'bg-purple-100 text-purple-700',
  arazi_sahibi: 'bg-amber-100 text-amber-700',
}

type Modal = { type: 'edit'; kullanici: any } | { type: 'davet' } | null

export function KullanicilarClient({ kullanicilar, araziler }: { kullanicilar: any[]; araziler: any[] }) {
  const [modal, setModal] = useState<Modal>(null)

  return (
    <>
      <div className="space-y-2">
        {kullanicilar.map((k: any) => (
          <div key={k.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{k.ad} {k.soyad}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{k.email}</p>
                {k.telefon && <p className="text-xs text-gray-400 mt-0.5">{k.telefon}</p>}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROL_COLORS[k.rol]}`}>
                  {ROL_LABELS[k.rol]}
                </span>
                {k.araziler && (
                  <span className="text-xs text-gray-400">Arazi #{k.araziler.numara}</span>
                )}
                <button
                  onClick={() => setModal({ type: 'edit', kullanici: k })}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1"
                >
                  <Pencil className="h-3 w-3" /> Düzenle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setModal({ type: 'davet' })}
        className="fixed bottom-24 right-4 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg text-sm font-semibold"
      >
        <UserPlus className="h-4 w-4" />
        Kullanıcı Davet Et
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative w-full bg-white rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {modal.type === 'edit' ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Davet Et'}
              </h3>
              <button onClick={() => setModal(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            {modal.type === 'edit' ? (
              <KullaniciEditForm
                kullanici={modal.kullanici}
                araziler={araziler}
                onClose={() => setModal(null)}
              />
            ) : (
              <DavetForm araziler={araziler} onClose={() => setModal(null)} />
            )}
          </div>
        </div>
      )}
    </>
  )
}
