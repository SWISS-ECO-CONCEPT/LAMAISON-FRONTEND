import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaShower, FaRulerCombined, FaHeart, FaRegHeart } from 'react-icons/fa'
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
  id: number;
  annonceId: number;
  userId: number;
  createdAt: Date;
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
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Erreur serveur (${res.status})`);
        }
        const data = await res.json()
        const likedAnnonce = data.find((a: FavoriResponse) => a.annonceId === id)
        setLiked(!!likedAnnonce)
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert('Erreur réseau lors de la mise à jour des favoris.')
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

      if (response.ok) {
        const nowLiked = !liked
        setLiked(nowLiked)
        // if (nowLiked) {
        //   alert('Post ajouté à votre liste de favoris.')
        // } else {
        //   alert('Post retiré de votre liste de favoris.')
        // }
      } else {
        const text = await response.text()
        console.error('Erreur API:', text)
        alert(text || 'Erreur lors de la mise à jour des favoris.')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert('Erreur réseau lors de la mise à jour des favoris.')
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

        {/* Badge en haut à droite
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow font-semibold">
          À saisir
        </div> */}
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
        <p className="text-green-600 font-extrabold text-base sm:text-lg">
          {prix.toLocaleString()} FCFA
        </p>

        {/* Caractéristiques */}
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 border-t pt-3">
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
