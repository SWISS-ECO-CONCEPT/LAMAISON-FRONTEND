import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaShower, FaRulerCombined, FaHeart, FaRegHeart, FaEye } from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { t } from 'i18next'
import { useAuth, useUser } from '@clerk/clerk-react'



const API_BASE = 'http://localhost:5000'
const toAbsoluteUrl = (u: string) => {
  if (!u) return ''
  // Keep absolute URLs and Vite asset URLs as-is
  if (u.startsWith('http') || u.startsWith('/assets') || u.startsWith('data:')) return u
  // Prefix backend upload paths
  if (u.startsWith('/uploads')) return `${API_BASE}${u}`
  if (u.startsWith('uploads')) return `${API_BASE}/${u}`
  // Otherwise leave as-is
  return u
}

interface FavoriResponse {
  id: number
  annonceId: number
  userId: number
  createdAt: Date
}

// Type des props reçues par la carte
type Props = {
  id: number
  titre: string
  ville: string
  prix: number
  images: string[]
  chambres: number
  douches: number
  surface: number
  vues?: number
  projet: 'achat' | 'location'
  negotiable?: boolean
  bn_reference?: string
}

const AnnonceCard: React.FC<Props> = ({
  id,
  titre,
  ville,
  prix,
  images,
  chambres,
  douches,
  surface,
  vues,
  projet,
  negotiable,
  bn_reference,
}) => {
  const { lng } = useParams<{ lng: string }>();
  const { isSignedIn, getToken } = useAuth()
  const [liked, setLiked] = useState(false)
  const { user } = useUser();

  const navigate = useNavigate()

  useEffect(() => {
      const run = async () => {        
      try {
      const token = await getToken()
      if (!token) {
        return
      }
      const clerkId = user?.id;
        if (!clerkId) throw new Error("Utilisateur introuvable (Clerk)");
        const res = await fetch(`${API_BASE}/favoris/${clerkId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        
        // Gérer le cas où l'annonce n'existe plus (404, 410)
        if (res.status === 404 || res.status === 410) {
          console.warn(`Annonce ${id} n'existe plus ou favoris inaccessibles`);
          setLiked(false);
          return;
        }
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Erreur serveur (${res.status})`);
        }
        const data = await res.json()
        const likedAnnonce = data.find((a: FavoriResponse) => a.annonceId === id)
        setLiked(!!likedAnnonce)
    } catch (error) {
      console.error('Erreur réseau favoris:', error)
      // Ne pas afficher d'alerte en cas d'erreur réseau mineure
      setLiked(false)
    }
    }
    run()
  }, [getToken, user?.id, id])

  const handleLike = async () => {
    if (!isSignedIn) {
      navigate(`/${lng}/signup`)
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        navigate(`/${lng}/signup`)
        return
      }
      const clerkId = user?.id;
        if (!clerkId) throw new Error("Utilisateur introuvable (Clerk)");

      const url = liked
        ? `${API_BASE}/favoris/${id}/${clerkId}`
        : `${API_BASE}/favoris/${clerkId}`

      const response = await fetch(url, {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: liked ? undefined : JSON.stringify({ annonceId: id }),
      })

      // Gérer le cas où l'annonce n'existe plus
      if (response.status === 404 || response.status === 410) {
        console.warn(`Annonce ${id} n'existe plus - suppression des favoris`);
        setLiked(false);
        return;
      }

      if (response.ok) {
        const nowLiked = !liked
        setLiked(nowLiked)
      } else {
        const text = await response.text()
        console.error('Erreur API favoris:', text)
        // Gérer les erreurs silencieusement sans alerte
        console.warn('Erreur lors de la mise à jour des favoris, annonce peut avoir été supprimée')
      }
    } catch (error) {
      console.error('Erreur réseau handleLike:', error)
      // Gestion silencieuse des erreurs réseau
    }
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition duration-300 hover:shadow-xl hover:scale-[1.015] h-full">

      {/* Carrousel Swiper pour les images */}
      <div className="relative w-full h-[220px] sm:h-[250px] md:h-[230px] xl:h-[230px] overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          loop
          className="w-full h-full"
        >
          {/* BN Reference Badge */}
          {bn_reference && (
            <div className="absolute top-3 left-3 z-10 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded-md">
              {bn_reference}
            </div>
          )}

          {/* Bouton favoris en overlay */}
          <button
              onClick={handleLike}
              className={`absolute top-3 right-3 z-10 transition-colors duration-300 ${
              liked ? 'text-red-600' : 'text-white hover:text-red-500'
              }`}
              aria-label="Ajouter aux favoris"
          >
               {liked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
          </button>

          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={toAbsoluteUrl(img)}
                alt={`${titre} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

       
      </div>

      {/* Contenu textuel */}
      <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
        {/* Titre et ville */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{titre}</h3>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <FaMapMarkerAlt className="text-green-600" />
            {ville}
          </p>
        </div>
   
        {/* Prix */}
        <div className="flex items-center justify-between">
          <p className="text-green-600 font-extrabold text-base sm:text-lg">
            {prix.toLocaleString()} FCFA
          </p>
          {negotiable && (
            <div className="px-2 py-1 rounded-full font-semibold text-xs text-white shadow-md bg-blue-500">
              {t('annonceForm.fields.negotiable')}
            </div>
          )}
        </div>
        {/* Caractéristiques */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 border-t pt-3">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <FaBed className="text-gray-500" /> {chambres} {t('annonceCard.ch')}
            </div>
            <div className="flex items-center gap-1">
              <FaShower className="text-gray-500" /> {douches} {t('annonceCard.sdb')}
            </div>
            <div className="flex items-center gap-1">
              <FaRulerCombined className="text-gray-500" /> {surface} m²
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full font-semibold text-xs text-white shadow-md
              ${projet === 'location' ? 'bg-yellow-400' : 'bg-green-600'}`}
            >
              {projet === 'location' ? t('projetTypeOptions.location') : t('projetTypeOptions.achat')}
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <FaEye />
              <span>{vues ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Bouton Voir plus */}
        <Link
          to={`/${lng}/post/${id}`}
          className="mt-4 inline-block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
        >
          {t('annonceCard.btn')}
        </Link>
      </div>
    </div>
  )
}

export default AnnonceCard

// import React from 'react'
// import { FaMapMarkerAlt, FaBed, FaShower, FaRulerCombined } from 'react-icons/fa'
// import { Link } from 'react-router-dom'
// import { Swiper, SwiperSlide } from 'swiper/react'
// import { Navigation, Pagination } from 'swiper/modules'


// type Props = {
//   id: number
//   titre: string
//   ville: string
//   prix: number
//   images: string[]
//   chambres: number
//   douches: number
//   surface: number
// }

// const AnnonceCard: React.FC<Props> = ({
//   id,
//   titre,
//   ville,
//   prix,
//   images,
//   chambres,
//   douches,
//   surface,
// }) => {
//   return (
    
//     <div className="flex flex-col bg-white border rounded-lg shadow-md overflow-hidden transition hover:shadow-lg h-full">

//       {/* Swiper avec ratio fixe (aspect-[4/3]) et hauteur constante */}
//       <div className="relative w-full h-[220px] sm:h-[250px] md:h-[230px] lg:h-[230px] xl:h-[230px] overflow-hidden">
//         <Swiper
//           modules={[Navigation, Pagination]}
//           navigation
//           pagination={{ clickable: true }}
//           loop
//           className="w-full h-full"
//         >
//           {images.map((img, index) => (
//             <SwiperSlide key={index}>
//               <img
//                 src={img}
//                 alt={`${titre} - ${index + 1}`}
//                 className="w-full h-full object-cover"
//               />
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
      

//       {/* Contenu texte */}
//       <div className="p-4 flex flex-col justify-between flex-grow">
//         <div className="space-y-1">
//           <h3 className="text-base sm:text-lg font-semibold line-clamp-1">{titre}</h3>
//           <p className="text-gray-600 text-sm flex items-center gap-1">
//             <FaMapMarkerAlt className="text-green-600" /> {ville}
//           </p>
//           <p className="text-green-600 font-bold text-sm sm:text-base">{prix.toLocaleString()} FCFA</p>
//         </div>

//         {/* Caractéristiques */}
//         <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-3">
//           <div className="flex items-center gap-1"><FaBed /> {chambres} ch.</div>
//           <div className="flex items-center gap-1"><FaShower /> {douches} sdb</div>
//           <div className="flex items-center gap-1"><FaRulerCombined /> {surface} m²</div>
//         </div>

//         {/* Bouton */}
//         <div className="mt-4">
//           <Link
//             to={`/annonce/${id}`}
//             className="inline-block w-full text-center bg-green-600 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 transition"
//           >
//             Voir plus
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AnnonceCard
