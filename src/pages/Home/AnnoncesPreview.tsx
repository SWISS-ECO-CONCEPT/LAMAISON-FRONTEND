import React, { useEffect, useState } from 'react'
import AnnonceCard from '../../components/AnnonceCard'
import { type SearchFilters } from '../../components/SearchBar'
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
  vues?: number | null
}

const API_BASE = 'http://localhost:5000'

interface AnnoncesPreviewProps {
  filters?: SearchFilters
}

const AnnoncesPreview: React.FC<AnnoncesPreviewProps> = ({ filters }) => {
  const [items, setItems] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour construire l'URL avec les paramètres de recherche
  const buildSearchUrl = (f: SearchFilters): string => {
    const params = new URLSearchParams()
    if (f.search) params.append('search', f.search)
    if (f.type) params.append('type', f.type)
    if (f.ville) params.append('ville', f.ville)
    if (f.projet) params.append('projet', f.projet)
    if (f.prixMin !== undefined) params.append('prixMin', f.prixMin.toString())
    if (f.prixMax !== undefined) params.append('prixMax', f.prixMax.toString())
    if (f.surfaceMin !== undefined) params.append('surfaceMin', f.surfaceMin.toString())
    if (f.surfaceMax !== undefined) params.append('surfaceMax', f.surfaceMax.toString())
    if (f.chambres !== undefined) params.append('chambres', f.chambres.toString())
    if (f.douches !== undefined) params.append('douches', f.douches.toString())

    const queryString = params.toString()
    return queryString ? `${API_BASE}/annonces?${queryString}` : `${API_BASE}/annonces`
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = filters ? buildSearchUrl(filters) : `${API_BASE}/annonces`
        const res = await fetch(url, { credentials: 'include' })
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
  }, [filters])

  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">{t('annoncepreview.recent')}</h2>

      {loading && <p className="text-center text-gray-600">{t('common.loading')}</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t('RechError.title')}</p>
              <p className="text-gray-500 mt-2">{t('RechError.body')}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {items.slice(0, 6).map((a) => (
                <AnnonceCard
                  key={a.id}
                  id={a.id}
                  titre={a.titre}
                  ville={a.ville}
                  prix={a.prix}
                  images={a.images}
                  chambres={a.chambres ?? 0}
                  douches={a.douches ?? 0}
                  surface={a.surface ?? 0}
                  vues={a.vues ?? 0}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default AnnoncesPreview

