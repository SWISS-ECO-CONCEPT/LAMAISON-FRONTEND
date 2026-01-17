import React, { useEffect, useState } from 'react'
// Import des composants nécessaires du carousel Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
// Import des modules pour les fonctionnalités avancées de Swiper
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
// Import du CSS global de Swiper pour le style par défaut du slider
import 'swiper/swiper-bundle.css'
// Import du mock d'annonces (tes données factices)
// import { AnnoncesMock } from '../../lib/mock'
// Import Link pour naviguer vers la page détail sans recharger la page
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import heroImage from '../../assets/img/hero.jpg'

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

// Utilitaire: transforme une URL relative en URL absolue
const toAbsoluteUrl = (u: string) => {
  if (!u) return ''
  if (u.startsWith('http') || u.startsWith('/assets') || u.startsWith('data:')) return u
  if (u.startsWith('/uploads')) return `${API_BASE}${u}`
  if (u.startsWith('uploads')) return `${API_BASE}/${u}`
  return u
}

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { lng } = useParams<{ lng: string }>();
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
        if (!cancelled) {
          // Trier les annonces par nombre de vues (décroissant) et prendre les 5 premières
          const sortedByViews = Array.isArray(data)
            ? data
              .sort((a: Annonce, b: Annonce) => (b.vues || 0) - (a.vues || 0))
              .slice(0, 5)
            : []
          setItems(sortedByViews)
        }
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
    // Conteneur principal du Hero, relatif pour positionner les enfants absolus
    <div className="relative h-[500px] w-full overflow-hidden">

      {/* Swiper : composant principal du slider */}
      <Swiper
        // On passe les modules qu'on veut activer dans Swiper : lecture automatique, pagination, navigation (flèches)
        modules={[Autoplay, Pagination, Navigation]}

        // Espace entre chaque slide (en pixels)
        spaceBetween={30}

        // Permet de centrer le slide actif
        centeredSlides={true}

        // Configuration de l'autoplay (défilement automatique)
        autoplay={{
          delay: 5000,          // délai entre chaque slide en ms (ici 5 secondes)
          disableOnInteraction: false,  // continue l'autoplay même après interaction utilisateur
        }}

        // Pagination cliquable : les petits points sous le slider sont interactifs
        pagination={{ clickable: true }}

        // Ajout des flèches de navigation à droite et gauche
        navigation

        // Classes CSS pour dimensionner et positionner le slider
        className="absolute inset-0 w-full h-full z-0 rounded-lg"
      >
        {/* 1er slide statique, toujours présent */}
        <SwiperSlide>
          <div className="relative w-full h-full">
            {/* Image de fond statique */}
            <img
              src={heroImage}
              alt="Hero"
              className="w-full h-full object-cover" // Pour que l’image prenne toute la taille et garde ses proportions
            />
            {/* Overlay foncé semi-transparent pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Contenu texte centré verticalement et horizontalement */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('heroSection.title')}
              </h1>
              <p className="text-lg md:text-xl mb-6">
                {t('heroSection.desc')}
              </p>
            </div>
          </div>
        </SwiperSlide>

        {/* Slides dynamiques : annonces avec le plus de vues */}
        {loading && items.length === 0 && (
          <SwiperSlide>
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-600">{t('common.loading')}</p>
            </div>
          </SwiperSlide>
        )}
        {error && items.length === 0 && (
          <SwiperSlide>
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-red-500">{error}</p>
            </div>
          </SwiperSlide>
        )}
        {!loading && !error && items.length === 0 && (
          <SwiperSlide>
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-600">Aucune annonce disponible</p>
            </div>
          </SwiperSlide>
        )}
        {items.map((annonce: Annonce) => (
          <SwiperSlide key={annonce.id}>
            <div className="relative w-full h-full">
              {/* Première image de l'annonce */}
              {annonce.images && annonce.images.length > 0 && (
                <img
                  src={toAbsoluteUrl(annonce.images[0])}
                  alt={annonce.titre}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlay foncé pour contraste */}
              <div className="absolute inset-0 bg-black/50" />
              {/* Contenu texte et bouton centré */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{annonce.titre}</h1>
                <p className="text-lg md:text-xl mb-6">
                  {annonce.ville} - {annonce.prix} FCFA
                </p>
                {/* Bouton cliquable qui emmène à la page détail de l'annonce */}
                <Link
                  to={`/${lng}/post/${annonce.id}`}  // Navigation SPA (pas de reload)
                  className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {t('heroSection.btn')}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default HeroSection

// import React from 'react'
// import { Swiper, SwiperSlide } from 'swiper/react'
// import { Autoplay, Pagination, Navigation } from 'swiper/modules'
// import 'swiper/swiper-bundle.css'
// import { AnnoncesMock } from '../../lib/mock'
// import { Link } from 'react-router-dom'
// import heroImage from '../../assets/img/hero.jpg'

// const HeroSection: React.FC = () => {
//   return (
//     <div className="relative h-[500px] w-full overflow-hidden">
//       <Swiper
//         modules={[Autoplay, Pagination, Navigation]}
//         spaceBetween={30}
//         centeredSlides={true}
//         autoplay={{
//           delay: 5000,
//           disableOnInteraction: false,
//         }}
//         pagination={{ clickable: true }}
//         navigation
//         className="absolute inset-0 w-full h-full z-0 rounded-lg"
//       >
//         {/* Premier slide statique avec texte d'accueil */}
//         <SwiperSlide>
//           <div className="relative w-full h-full">
//             {/* Image de fond statique, tu peux remplacer hero.jpg par ta vraie image */}
//             <img
//               src={heroImage}  // Remplace par ton image d'accueil
//               alt="Hero"
//               className="w-full h-full object-cover"
//             />
//             {/* Overlay foncé */}
//             <div className="absolute inset-0 bg-black/50" />
//             {/* Texte centré */}
//             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
//               <h1 className="text-4xl md:text-5xl font-bold mb-4">Trouvez le bien immobilier idéal</h1>
//               <p className="text-lg md:text-xl mb-6">Avec LAMAISON, explorez des milliers d’annonces en un clic.</p>
//             </div>
//           </div>
//         </SwiperSlide>

//         {/* Les 5 slides d'annonces */}
//         {AnnoncesMock.slice(0, 5).map((annonce) => (
//           <SwiperSlide key={annonce.id}>
//             <div className="relative w-full h-full">
//               <img
//                 src={annonce.images ? annonce.images[0] : annonce.images} // adapte selon ton mock
//                 alt={annonce.titre}
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-black/50" />
//               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
//                 <h1 className="text-3xl md:text-5xl font-bold mb-4">{annonce.titre}</h1>
//                 <p className="text-lg md:text-xl mb-6">{annonce.ville} - {annonce.prix} FCFA</p>
//                 <Link
//                   to={`/annonce/${annonce.id}`}
//                   className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                 >
//                   Voir l'annonce
//                 </Link>
//               </div>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   )
// }

