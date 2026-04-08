import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import OwnerCard from '../../components/OwnerCard'
import RdvModal from '../../components/RdvModal'
import { FaBed, FaRulerCombined, FaShower, FaEye } from 'react-icons/fa'
import { t } from 'i18next'
// import DateSejourPicker, { type DatesSejour } from '../../components/DateSejourPicker'

type ProprietaireOwnerCard = {
  nom: string
  tel: string
  email: string
  type: 'AGENT' | 'PROSPECT' 
}

type Annonce = {
  id: number
  titre: string
  description: string
  prix: number
  ville: string
  quartier?: string | null
  type?: string | null
  surface?: number | null
  chambres?: number | null
  douches?: number | null
  images: string[]
  vues?: number
  proprietaire?: {
    id: number
    firstname: string
    role: 'AGENT' | 'PROSPECT'
    phone?: string | null
    email?: string | null
    avatar?: string | null
  } | null
  createdAt?: string
}

const API_BASE = 'http://localhost:5000'

// Utilitaire: transforme une URL relative (ex: /uploads/xxx.jpg) en URL absolue
const toAbsoluteUrl = (u: string) => (u?.startsWith('http') ? u : `${API_BASE}${u || ''}`)

const AnnonceDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [a, setAnnonce] = useState<Annonce | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRdv, setShowRdv] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Typage explicite
  // const [datesSejour, setDatesSejour] = useState<DatesSejour>({
  //   startDate: null,
  //   endDate: null
  // })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/annonces/${id}`, { credentials: 'include' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Erreur serveur (${res.status})`)
        }
        const data: Annonce = await res.json()
        if (!cancelled) {
          setAnnonce(data)
          // Incrémente le nombre de vues côté backend (erreurs silencieuses)
          fetch(`${API_BASE}/annonces/${id}/view`, {
            method: 'POST',
            credentials: 'include',
          }).catch((e) => {
            console.warn('Impossible d’incrémenter les vues :', e)
          })
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [id])

  const isMeuble = a?.type?.toLowerCase() === 'meublé'

  if (loading) {
    return (
      <div className="mt-24 px-4">
        <div className="text-center text-gray-600">Chargement…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-24 px-4">
        <div className="bg-red-100 text-red-700 p-4 rounded text-center shadow">
          <h1 className="text-lg sm:text-xl font-semibold">{error}</h1>
        </div>
      </div>
    )
  }

  if (!a) {
    return (
      <div className="mt-24 px-4">
        <div className="bg-red-100 text-red-700 p-4 rounded text-center shadow">
          <h1 className="text-lg sm:text-xl font-semibold">Annonce introuvable</h1>
        </div>
      </div>
    )
  }

  if (!a.proprietaire) {
    return (
      <div className="mt-24 px-4">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center shadow">
          <h1 className="text-lg sm:text-xl font-semibold">Propriétaire non renseigné</h1>
        </div>
      </div>
    )
  }

  const proprietaire: ProprietaireOwnerCard = {
    nom: a.proprietaire.firstname || 'N/A',
    tel: a.proprietaire.phone || '',
    email: a.proprietaire.email || '',
    type: a.proprietaire.role,
  }

  return (
    <div className="mt-24 px-4 max-w-4xl mx-auto">
      {/* Bouton de retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
      >
        ← Retour
      </button>
      
      <div className="border rounded-lg shadow-sm p-4 md:p-6 flex flex-col gap-4 bg-white">
        {/* Swiper */}
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          loop
          className="w-full h-60 sm:h-72 md:h-80 rounded overflow-hidden bg-gray-100"
        >
          {a.images.map((img: string, index: number) => (
            <SwiperSlide key={index}>
              <img 
                src={toAbsoluteUrl(img)} 
                alt={`${a.titre} - ${index + 1}`} 
                className="w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity" 
                onClick={() => setSelectedImageIndex(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{a.titre}</h3>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-gray-600 text-sm sm:text-base">{a.ville}{a.quartier ? `, ${a.quartier}` : ''}</p>
            <p className="text-green-600 font-bold text-base sm:text-lg">{a.prix} fcfa</p>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <FaEye />
            <span>{a.vues ?? 0}</span>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="mt-4 text-sm text-gray-700 grid grid-cols-2 sm:grid-cols-3 gap-y-2">
          <p><span className="font-semibold">Type :</span> {a.type}</p>
          <div className="inline-flex items-center gap-2">
            <FaRulerCombined />
            <p><span className="font-semibold">{t('annonceDetail.surf')} :</span> {a.surface}m²</p>
          </div>
          <div className="inline-flex items-center gap-2">
            <FaBed />
            <p><span className="font-semibold">{t('searchbar.chambre')} :</span> {a.chambres}</p>
          </div>
          <div className="inline-flex items-center gap-2">
            <FaShower />
            <p><span className="font-semibold">{t('annonceDetail.douches')} :</span> {a.douches}</p>
          </div>
          <p><span className="font-semibold">{t('annonceDetail.pub')} :</span> {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</p>
        </div>

        {/* Aperçu */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('annonceDetail.aper')}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {a.description}
                {/* <span className="block mt-2 font-medium text-green-700">
                  Prix : {a?.prix?.toLocaleString()} FCFA
                </span> */}
              </p>
            </div>
          </div>
        </div>

        {/* Sélection du séjour */}
        {/* {isMeuble && <DateSejourPicker onChange={setDatesSejour} />} */}

        {/* Carte propriétaire */}
        <OwnerCard
          nom={proprietaire.nom}
          tel={proprietaire.tel}
          email={proprietaire.email}
          type={proprietaire.type}
          onPrendre={() => setShowRdv(true)}
          isMeuble={isMeuble}
          // onChangeDates={setDatesSejour}
        />
      </div>

      <RdvModal
        isOpen={showRdv}
        onClose={() => setShowRdv(false)}
        proprietaireNom={proprietaire.nom}
        proprietaireTel={proprietaire.tel}
         proprietaireId={a?.proprietaire?.id || 0}
         annonceId={a?.id || 0}
        // datesSejour={datesSejour}
      />

      {/* Lightbox / Plein écran avec Swiper */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-default animate-in fade-in duration-300"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl hover:scale-110 transition-transform focus:outline-none z-[110]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(null);
            }}
          >
            &times;
          </button>
          
          <div 
            className="w-full h-full flex items-center justify-center p-4 max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true, type: 'fraction' }}
              initialSlide={selectedImageIndex}
              className="w-full h-full lightbox-swiper"
              centeredSlides={true}
              slidesPerView={1}
              spaceBetween={0}
              onSwiper={(swiper) => {
                // Style personnalisé pour les flèches du Swiper dans la lightbox
                const nextEl = swiper.navigation.nextEl as HTMLElement;
                const prevEl = swiper.navigation.prevEl as HTMLElement;
                if (nextEl) nextEl.style.color = 'white';
                if (prevEl) prevEl.style.color = 'white';
              }}
            >
              {a.images.map((img: string, index: number) => (
                <SwiperSlide key={index} className="!flex !items-center !justify-center bg-transparent">
                  <img 
                    src={toAbsoluteUrl(img)} 
                    alt={`Plein écran ${index + 1}`} 
                    className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnonceDetail

