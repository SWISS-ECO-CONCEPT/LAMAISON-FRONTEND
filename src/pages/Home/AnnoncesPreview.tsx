import React, { useEffect, useState } from 'react'
import AnnonceCard from '../../components/AnnonceCard'
import { t } from 'i18next'

type Annonce = {
  id: number
  titre: string
  description: string
  prix: number
  ville: string
  images: string[]
  surface?: number | null
  chambres?: number | null
  douches?: number | null
}

const API_BASE = 'http://localhost:5000'

const AnnoncesPreview: React.FC = () => {
  const [items, setItems] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 


  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/annonces`, { credentials: 'include' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Erreur serveur (${res.status})`)
        }
        const data = await res.json()
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])
  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">{t('annoncepreview.recent')}</h2>

      {loading && <p className="text-center text-gray-600">{t('common.loading')}</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Grille responsive : 1 colonne sur mobile, 2 sur petits écrans, 3 sur grands */}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.slice(0, 6).map((a) => (
            <AnnonceCard
              key={a.id} // toujours ajouter une key ici
              id={a.id}
              titre={a.titre}
              ville={a.ville}
              prix={a.prix}
              images={a.images}
              chambres={a.chambres ?? 0}
              douches={a.douches ?? 0}
              surface={a.surface ?? 0}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default AnnoncesPreview

