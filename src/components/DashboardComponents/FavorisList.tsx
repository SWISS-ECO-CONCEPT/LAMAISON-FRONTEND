import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const API_BASE = "http://localhost:5000";

const toAbsoluteUrl = (u: string) => {
  if (!u) return "";
  if (u.startsWith("http") || u.startsWith("/assets") || u.startsWith("data:")) return u;
  if (u.startsWith("/uploads")) return `${API_BASE}${u}`;
  if (u.startsWith("uploads")) return `${API_BASE}/${u}`;
  return u;
};

type Favori = {
  id: number;
  annonceId: number;
  createdAt: string;
  annonce: {
    id: number;
    titre: string;
    prix: number;
    images: string[];
    ville?: string | null;
    type?: string | null;
  };
};

const FavorisList: React.FC = () => {
  const { isSignedIn, getToken } = useAuth();
  const { lng } = useParams<{ lng: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [favorisSet, setFavorisSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const clerkId = user?.id;
        if (!clerkId) throw new Error("Utilisateur introuvable (Clerk)");

        const res = await fetch(`${API_BASE}/favoris/${clerkId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Erreur serveur (${res.status})`);
        }

        const raw = await res.text();
        let data: unknown;
        try {
          data = raw ? JSON.parse(raw) : [];
        } catch {
          throw new Error(raw || "Réponse inattendue du serveur (non JSON).");
        }
        if (!cancelled) {
          const favs = Array.isArray(data) ? (data as Favori[]) : [];
          setFavoris(favs);
          setFavorisSet(new Set(favs.map((f) => f.annonceId))); // important !
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken, user?.id]);

  const handleGoToAnnonce = (annonceId: number) => {
    if (!lng) {
      navigate(`/post/${annonceId}`);
    } else {
      navigate(`/${lng}/post/${annonceId}`);
    }
  };

  const toggleFavori = async (annonceId: number) => {
    const token = await getToken();
    if (!token || !user?.id) return;

    try {
      if (favorisSet.has(annonceId)) {
        // Remove from favorites
        await fetch(`${API_BASE}/favoris/${user.id}/${annonceId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Update both the set and the favorites list
        setFavoris(prev => prev.filter(fav => fav.annonceId !== annonceId));
        setFavorisSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(annonceId);
          return newSet;
        });
      } else {
        // Add to favorites
        const response = await fetch(`${API_BASE}/favoris/${user.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ annonceId }),
        });
        
        if (response.ok) {
          const newFav = await response.json();
          setFavoris(prev => [...prev, newFav]);
          setFavorisSet(prev => new Set(prev).add(annonceId));
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-4 text-center text-gray-700">
        <p>Connectez-vous pour voir vos favoris.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>

      {loading && <div className="text-gray-600">Chargement…</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {!loading && favoris.length === 0 && !error && (
        <div className="text-gray-600">Vous n'avez encore aucun favori.</div>
      )}

      <ol className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {favoris.map((fav) => (
          <li
            key={fav.id}
            className="border rounded-lg shadow-md bg-white overflow-hidden flex flex-col"
          >
            <div className="relative w-full">
              <Swiper
                spaceBetween={10}
                slidesPerView={1}
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                loop
                className="w-full h-full"
              >
                {fav.annonce.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={toAbsoluteUrl(img)}
                      alt={`${fav.annonce.titre}-${index}`}
                      className="w-full h-56 sm:h-64 md:h-72 object-cover"
                    />
                    <button
                      onClick={() => toggleFavori(fav.annonceId)}
                      className={`absolute top-3 right-3 z-10 transition-colors duration-300 ${
                        favorisSet.has(fav.annonceId) ? 'text-red-600' : 'text-white hover:text-red-500'
                      }`}
                      aria-label={favorisSet.has(fav.annonceId) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {favorisSet.has(fav.annonceId) ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-semibold text-lg">{fav.annonce.titre}</h2>
                {fav.annonce.ville && (
                  <p className="text-sm text-gray-500">{fav.annonce.ville}</p>
                )}
                {fav.annonce.type && (
                  <p className="text-xs text-gray-400">{fav.annonce.type}</p>
                )}
                <p className="text-gray-700 font-medium mt-1">
                  {fav.annonce.prix.toLocaleString()} FCFA
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handleGoToAnnonce(fav.annonceId)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Voir l'annonce
                </button>

              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default FavorisList;

// import React, { useEffect, useState } from "react";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import { useNavigate, useParams } from "react-router-dom";

// const API_BASE = "http://localhost:5000";

// const toAbsoluteUrl = (u: string) => {
//   if (!u) return "";
//   if (u.startsWith("http") || u.startsWith("/assets") || u.startsWith("data:")) return u;
//   if (u.startsWith("/uploads")) return `${API_BASE}${u}`;
//   if (u.startsWith("uploads")) return `${API_BASE}/${u}`;
//   return u;
// };

// // Shape returned by /favoris with include: { annonce: true }
// type Favori = {
//   id: number;
//   annonceId: number;
//   createdAt: string;
//   annonce: {
//     id: number;
//     titre: string;
//     prix: number;
//     images: string[];
//     ville?: string | null;
//     type?: string | null;
//   };
// };

// const FavorisList: React.FC = () => {
//   const { isSignedIn, getToken } = useAuth();
//   const { lng } = useParams<{ lng: string }>();
//   const navigate = useNavigate();
//   const { user } = useUser();
//   const [favoris, setFavoris] = useState<Favori[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     const run = async () => {
//       if (!isSignedIn) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);
//       try {
//         const token = await getToken();
//         if (!token) {
//           setLoading(false);
//           return;
//         }
//         const clerkId = user?.id;
//         if (!clerkId) throw new Error("Utilisateur introuvable (Clerk)");

//         const res = await fetch(`${API_BASE}/favoris/${clerkId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//         });
//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(text || `Erreur serveur (${res.status})`);
//         }

//         // Réponse attendue: JSON. Si le backend renvoie du texte (ex: "API LAMAISON fonctionne"),
//         // on évite l'erreur "Unexpected token" et on remonte le texte comme message d'erreur.
//         const raw = await res.text();
//         let data: unknown;
//         try {
//           data = raw ? JSON.parse(raw) : [];
//         } catch {
//           throw new Error(raw || 'Réponse inattendue du serveur (non JSON).');
//         }
//         if (!cancelled) {
//           setFavoris(Array.isArray(data) ? data as Favori[] : []);
//         }
//       } catch (e: unknown) {
//         if (!cancelled) setError(e instanceof Error ? e.message : String(e));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     run();
//     return () => {
//       cancelled = true;
//     };
//   }, [isSignedIn, getToken]);

//   const handleGoToAnnonce = (annonceId: number) => {
//     if (!lng) {
//       navigate(`/post/${annonceId}`);
//     } else {
//       navigate(`/${lng}/post/${annonceId}`);
//     }
//   };

//   if (!isSignedIn) {
//     return (
//       <div className="p-4 text-center text-gray-700">
//         <p>Connectez-vous pour voir vos favoris.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 sm:px-6 lg:px-8">
//       <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>

//       {loading && <div className="text-gray-600">Chargement…</div>}
//       {error && <div className="text-red-600 mb-4">{error}</div>}

//       {!loading && favoris.length === 0 && !error && (
//         <div className="text-gray-600">Vous n\'avez encore aucun favori.</div>
//       )}

//       <ol className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
//         {favoris.map((fav) => (
//           <li
//             key={fav.id}
//             className="border rounded-lg shadow-md bg-white overflow-hidden flex flex-col"
//           >
//             <Swiper
//               spaceBetween={10}
//               slidesPerView={1}
//               modules={[Navigation, Pagination]}
//               navigation
//               pagination={{ clickable: true }}
//               loop
//               className="w-full h-full"
//             >
//               {fav.annonce.images.map((img, index) => (
//                 <SwiperSlide key={index}>
//                   <img
//                     src={toAbsoluteUrl(img)}
//                     alt={`${fav.annonce.titre}-${index}`}
//                     className="w-full h-56 sm:h-64 md:h-72 object-cover"
//                   />
//                 </SwiperSlide>
//               ))}
//             </Swiper>

//             <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div>
//                 <h2 className="font-semibold text-lg">{fav.annonce.titre}</h2>
//                 {fav.annonce.ville && (
//                   <p className="text-sm text-gray-500">{fav.annonce.ville}</p>
//                 )}
//                 {fav.annonce.type && (
//                   <p className="text-xs text-gray-400">{fav.annonce.type}</p>
//                 )}
//                 <p className="text-gray-700 font-medium mt-1">
//                   {fav.annonce.prix.toLocaleString()} FCFA
//                 </p>
//               </div>

//               <button
//                 onClick={() => handleGoToAnnonce(fav.annonceId)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
//               >
//                 Voir l\'annonce
//               </button>
//             </div>
//           </li>
//         ))}
//       </ol>
//     </div>
//   );
// };

// export default FavorisList;
