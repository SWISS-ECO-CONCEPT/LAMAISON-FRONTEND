import React, { useEffect, useState } from 'react'
import AnnonceCard from '../../components/AnnonceCard'
import SearchBar, { type SearchFilters } from '../../components/SearchBar'
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

const Annonces: React.FC = () => {
    const [items, setItems] = useState<Annonce[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({})

    // Fonction pour construire l'URL avec les paramètres de recherche
    const buildSearchUrl = (filters: SearchFilters): string => {
        const params = new URLSearchParams()

        if (filters.search) params.append('search', filters.search)
        if (filters.type) params.append('type', filters.type)
        if (filters.ville) params.append('ville', filters.ville)
        if (filters.projet) params.append('projet', filters.projet)
        if (filters.prixMin !== undefined) params.append('prixMin', filters.prixMin.toString())
        if (filters.prixMax !== undefined) params.append('prixMax', filters.prixMax.toString())
        if (filters.surfaceMin !== undefined) params.append('surfaceMin', filters.surfaceMin.toString())
        if (filters.surfaceMax !== undefined) params.append('surfaceMax', filters.surfaceMax.toString())
        if (filters.chambres !== undefined) params.append('chambres', filters.chambres.toString())
        if (filters.douches !== undefined) params.append('douches', filters.douches.toString())

        const queryString = params.toString()
        const url = queryString ? `${API_BASE}/annonces?${queryString}` : `${API_BASE}/annonces`
        console.log('Annonces - buildSearchUrl: ', url); // Debug log
        return url
    }

    useEffect(() => {
        let cancelled = false
        console.log('Annonces - useEffect triggered with searchFilters:', searchFilters); // Debug log
        const run = async () => {
            setLoading(true)
            setError(null)
            try {
                const url = buildSearchUrl(searchFilters)
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
    }, [searchFilters])

    return (
        <section className="py-8 px-4 max-w-6xl mx-auto mt-14">
            <h2 className="text-2xl font-semibold mb-6 text-center">{t('annonces.tteA')}</h2>

            <div className="px-4 py-8 md:px-0">
                <SearchBar onSearch={setSearchFilters} />
            </div>

            {loading && <p className="text-center text-gray-600">{t('common.loading')}</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && (
                <>
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">Aucune annonce ne correspond à votre recherche</p>
                            <p className="text-gray-500 mt-2">Essayez de modifier vos filtres ou votre recherche</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-3">
                            {items.map((a) => (
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

export default Annonces

