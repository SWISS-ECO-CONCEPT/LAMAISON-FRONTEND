import React, { useEffect, useState, useCallback } from 'react'
import AnnonceCard from '../../components/AnnonceCard'
import SearchBar, { type SearchFilters } from '../../components/SearchBar'
import Pagination from '../../components/Pagination'
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
    projet: 'achat' | 'location'
    negotiable?: boolean
    bn_reference?: string
}

const API_BASE = 'http://localhost:5000'

const Annonces: React.FC = () => {
    const [items, setItems] = useState<Annonce[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [totalItems, setTotalItems] = useState(0)

    // Fonction pour construire l'URL avec les paramètres de recherche
    const buildSearchUrl = useCallback((filters: SearchFilters): string => {
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

        // Ajouter les paramètres de pagination
        params.append('page', currentPage.toString())
        params.append('limit', itemsPerPage.toString())

        const queryString = params.toString()
        const url = queryString ? `${API_BASE}/annonces?${queryString}` : `${API_BASE}/annonces`
        console.log('Annonces - buildSearchUrl: ', url); // Debug log
        return url
    }, [currentPage, itemsPerPage])

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
                if (!cancelled) {
                    // Gérer la réponse paginée
                    if (data.data && Array.isArray(data.data)) {
                        setItems(data.data)
                        setTotalItems(data.total || data.data.length)
                    } else {
                        setItems(Array.isArray(data) ? data : [])
                        setTotalItems(Array.isArray(data) ? data.length : 0)
                    }
                }
            } catch (e: unknown) {
                if (!cancelled) setError(e instanceof Error ? e.message : String(e))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        run()
        return () => { cancelled = true }
    }, [searchFilters, currentPage, itemsPerPage, buildSearchUrl])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <section className="py-8 px-4 max-w-6xl mx-auto mt-14">
            <h2 className="text-2xl font-semibold mb-6 text-center">{t('annonces.tteA')}</h2>
            <div className="px-4 py-8 md:px-0">
                <SearchBar onSearch={setSearchFilters} />
                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={(newItemsPerPage) => {
                        setItemsPerPage(newItemsPerPage)
                        setCurrentPage(1) // Reset to first page when changing items per page
                    }}
                />

            </div>

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
                        <div className="grid gap-6 md:grid-cols-3">
                            {items.map((a: Annonce) => (
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
                                    projet={a.projet}
                                    negotiable={a.negotiable}
                                    bn_reference={a.bn_reference}
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

