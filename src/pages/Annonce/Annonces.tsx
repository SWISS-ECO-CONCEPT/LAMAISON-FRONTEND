import React, { useEffect, useState } from 'react'
import AnnonceCard from '../../components/AnnonceCard'
import SearchBar from '../../components/SearchBar' 
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

const Annonces: React.FC = () => {
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
        <section className="py-8 px-4 mt-14">
            <h2 className="text-2xl font-semibold mb-6 text-center">{t('annonces.tteA')}</h2>

            <div className="px-4 py-8 md:px-0">
                <SearchBar />
            </div>

            {loading && <p className="text-center text-gray-600">{t('common.loading')}</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && (
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
                        />
                    ))}
                </div>
            )}
        </section>

    )
}

export default Annonces

