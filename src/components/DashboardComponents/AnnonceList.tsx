import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import SearchBar from "../SearchBar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

const API_BASE = "http://localhost:5000";
const toAbsoluteUrl = (u: string) => {
  if (!u) return "";
  if (u.startsWith("http") || u.startsWith("/assets") || u.startsWith("data:")) return u;
  if (u.startsWith("/uploads")) return `${API_BASE}${u}`;
  if (u.startsWith("uploads")) return `${API_BASE}/${u}`;
  return u;
};

type Annonce = {
  id: number;
  titre: string;
  prix: number;
  type?: string | null;
  images: string[];
};

const AnnonceList: React.FC = () => {
  const location = useLocation();
  const role = location.pathname.includes("prospect") ? "PROSPECT" : "AGENT";

  const { user } = useUser();
  const { getToken } = useAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ titre: string; prix: string; type: string }>({ titre: "", prix: "", type: "" });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/annonces/user/${user.id}`, { credentials: 'include' });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Erreur serveur (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) setAnnonces(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true };
  }, [user?.id]);

  const startEdit = (a: Annonce) => {
    setEditingId(a.id);
    setEditData({ titre: a.titre || "", prix: String(a.prix ?? ""), type: a.type || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentification requise");
      const payload: Pick<Annonce, 'titre' | 'prix' | 'type'> = {
        titre: editData.titre,
        prix: Number(editData.prix) || 0,
        type: editData.type || null,
      };
      const res = await fetch(`${API_BASE}/annonces/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur mise à jour (${res.status})`);
      }
      const json = await res.json();
      const updated = json?.data;
      setAnnonces((list) => list.map((x) => (x.id === id ? { ...x, ...updated } : x)));
      setEditingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const deleteAnnonce = async (id: number) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentification requise');
      const res = await fetch(`${API_BASE}/annonces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      console.log(token)
      console.log(res.headers);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur suppression (${res.status})`);
      }
      setAnnonces((list) => list.filter((x) => x.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="relative space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Titre */}
      <h1 className="text-2xl font-bold">Mes annonces publiées</h1>

      {/* SearchBar bien visible */}
      <div className="w-full max-w-3xl">
        <SearchBar />
      </div>

      {/* Liste des annonces */}
      {loading && <div className="text-gray-600">Chargement…</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ol className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {annonces.map((annonce) => (
          <li
            key={annonce.id}
            className="border rounded-lg shadow-md bg-white overflow-hidden flex flex-col"
          >
            {/* Carrousel d'images (responsive) */}
            <Swiper spaceBetween={10} slidesPerView={1}
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              loop
              className="w-full h-full">
              {annonce.images.map((img: string, index: number) => (
                <SwiperSlide key={index}>
                  <img
                    src={toAbsoluteUrl(img)}
                    alt={`${annonce.titre}-${index}`}
                    className="w-full h-56 sm:h-64 md:h-72 object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Infos + Actions */}
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                {editingId === annonce.id ? (
                  <div className="space-y-2">
                    <input
                      className="border px-2 py-1 rounded w-full"
                      value={editData.titre}
                      onChange={(e) => setEditData((p) => ({ ...p, titre: e.target.value }))}
                      placeholder="Titre"
                    />
                    <input
                      className="border px-2 py-1 rounded w-full"
                      type="number"
                      value={editData.prix}
                      onChange={(e) => setEditData((p) => ({ ...p, prix: e.target.value }))}
                      placeholder="Prix"
                    />
                    <input
                      className="border px-2 py-1 rounded w-full"
                      value={editData.type}
                      onChange={(e) => setEditData((p) => ({ ...p, type: e.target.value }))}
                      placeholder="Type"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="font-semibold text-lg">{annonce.titre}</h2>
                    <p className="text-sm text-gray-500">{annonce.type}</p>
                    <p className="text-gray-700 font-medium">{annonce.prix} FCFA</p>
                  </>
                )}
              </div>

              {/* Actions agent */}
              {role === "AGENT" && (
                <div className="flex gap-2">
                  {editingId === annonce.id ? (
                    <>
                      <button onClick={() => saveEdit(annonce.id)} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Enregistrer</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(annonce)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                        Modifier
                      </button>
                      <button onClick={() => deleteAnnonce(annonce.id)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default AnnonceList;
