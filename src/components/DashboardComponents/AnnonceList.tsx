import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import SearchBar, { type SearchFilters } from "../SearchBar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FaBed, FaRuler, FaShower, FaEdit, FaTrash, FaMapMarkerAlt } from "react-icons/fa";

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
  description?: string;
  prix: number;
  ville?: string;
  type?: string | null;
  surface?: number | null;
  chambres?: number | null;
  douches?: number | null;
  projet?: string | null;
  images: string[];
};

const AnnonceList: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const role = location.pathname.includes("prospect") ? "PROSPECT" : "AGENT";

  const { user } = useUser();
  const { getToken } = useAuth();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [filteredAnnonces, setFilteredAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    titre: string;
    description: string;
    prix: string;
    ville: string;
    type: string;
    surface: string;
    chambres: string;
    douches: string;
  }>({
    titre: "",
    description: "",
    prix: "",
    ville: "",
    type: "",
    surface: "",
    chambres: "",
    douches: "",
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('🔄 Fetching annonces for user:', user.id);
        const res = await fetch(`${API_BASE}/annonces/user/${user.id}`, {
          credentials: 'include',
          headers,
        });
        console.log('📦 Response status:', res.status);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Erreur serveur (${res.status})`);
        }
        const data = await res.json();
        console.log('✅ Annonces reçues:', data);
        if (!cancelled) {
          const annoncesData = Array.isArray(data) ? data : data?.data ? data.data : [];
          setAnnonces(annoncesData);
          setFilteredAnnonces(annoncesData);
        }
      } catch (e: unknown) {
        console.error('❌ Erreur fetch annonces:', e);
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true };
  }, [user?.id, getToken]);

  // Filtrer les annonces en fonction des critères de recherche
  useEffect(() => {
    let filtered = [...annonces];
    
    if (searchFilters.search) {
      filtered = filtered.filter(annonce => 
        annonce.titre.toLowerCase().includes(searchFilters.search!.toLowerCase()) ||
        annonce.description?.toLowerCase().includes(searchFilters.search!.toLowerCase()) ||
        annonce.ville?.toLowerCase().includes(searchFilters.search!.toLowerCase())
      );
    }
    
    if (searchFilters.type) {
      filtered = filtered.filter(annonce => annonce.type === searchFilters.type);
    }
    
    if (searchFilters.ville) {
      filtered = filtered.filter(annonce => 
        annonce.ville?.toLowerCase().includes(searchFilters.ville!.toLowerCase())
      );
    }
    
    if (searchFilters.prixMin !== undefined) {
      filtered = filtered.filter(annonce => annonce.prix >= searchFilters.prixMin!);
    }
    
    if (searchFilters.prixMax !== undefined) {
      filtered = filtered.filter(annonce => annonce.prix <= searchFilters.prixMax!);
    }
    
    if (searchFilters.surfaceMin !== undefined) {
      filtered = filtered.filter(annonce => annonce.surface && annonce.surface >= searchFilters.surfaceMin!);
    }
    
    if (searchFilters.surfaceMax !== undefined) {
      filtered = filtered.filter(annonce => annonce.surface && annonce.surface <= searchFilters.surfaceMax!);
    }
    
    if (searchFilters.chambres !== undefined) {
      filtered = filtered.filter(annonce => annonce.chambres && annonce.chambres >= searchFilters.chambres!);
    }
    
    if (searchFilters.douches !== undefined) {
      filtered = filtered.filter(annonce => annonce.douches && annonce.douches >= searchFilters.douches!);
    }
    
    if (searchFilters.projet) {
      filtered = filtered.filter(annonce => annonce.projet === searchFilters.projet);
    }
    
    setFilteredAnnonces(filtered);
  }, [annonces, searchFilters]);

  const startEdit = (a: Annonce) => {
    setEditingId(a.id);
    setEditData({
      titre: a.titre || "",
      description: a.description || "",
      prix: String(a.prix ?? ""),
      ville: a.ville || "",
      type: a.type || "",
      surface: String(a.surface ?? ""),
      chambres: String(a.chambres ?? ""),
      douches: String(a.douches ?? ""),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentification requise");
      const payload = {
        titre: editData.titre,
        description: editData.description,
        prix: Number(editData.prix) || 0,
        ville: editData.ville || undefined,
        type: editData.type || undefined,
        surface: editData.surface ? Number(editData.surface) : undefined,
        chambres: editData.chambres ? Number(editData.chambres) : undefined,
        douches: editData.douches ? Number(editData.douches) : undefined,
      };
      console.log('🔄 Mise à jour annonce:', { id, payload, token: token?.substring(0, 20) + '...' });
      const res = await fetch(`${API_BASE}/annonces/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      console.log('✅ Response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur mise à jour (${res.status})`);
      }
      const json = await res.json();
      const updated = json?.data;
      console.log('✅ Annonce mise à jour:', updated);
      setAnnonces((list) => list.map((x) => (x.id === id ? { ...x, ...updated } : x)));
      setSuccess('✅ Annonce mise à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);
      setEditingId(null);
    } catch (e: unknown) {
      console.error('❌ Erreur saveEdit:', e);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const deleteAnnonce = async (id: number) => {
    if (!confirm(t('annonceList.actions.deleteConfirm'))) return;
    try {
      const token = await getToken();
      if (!token) throw new Error(t('annonceList.errors.authRequired'));
      console.log('🗑️ Suppression annonce:', { id, token: token?.substring(0, 20) + '...' });
      const res = await fetch(`${API_BASE}/annonces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      console.log('✅ Delete response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur suppression (${res.status})`);
      }
      console.log('✅ Annonce supprimée de la BD');
      setAnnonces((list) => list.filter((x) => x.id !== id));
      setSuccess('✅ Annonce supprimée avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: unknown) {
      console.error('❌ Erreur deleteAnnonce:', e);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="relative space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Titre */}
      <h1 className="text-2xl font-bold">{t('annonceList.myListingsTitle')}</h1>

      {/* SearchBar bien visible */}
      <div className="w-full max-w-3xl">
        <SearchBar onSearch={setSearchFilters} />
      </div>

      {/* Liste des annonces */}
      {loading && <div className="text-gray-600">{t('annonceList.loading')}</div>}
      {error && <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">❌ {error}</div>}
      {success && <div className="text-green-600 bg-green-50 p-3 rounded border border-green-200">{success}</div>}
      {!loading && !error && (
        <>
          {filteredAnnonces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t('RechError.title')}</p>
              <p className="text-gray-500 mt-2">{t('RechError.body')}</p>
            </div>
          ) : (
            <ol className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {filteredAnnonces.map((annonce) => (
                <li
                  key={annonce.id}
                  className={`border rounded-lg shadow-md bg-white overflow-hidden flex flex-col transition ${editingId === annonce.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                {editingId === annonce.id ? (
                  /* Mode édition : pas de carrousel */
                  <div className="p-6 space-y-4 flex-1">
                    <h3 className="text-lg font-bold text-blue-600">{t('annonceList.actions.edit')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Titre */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.title')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          value={editData.titre}
                          onChange={(e) => setEditData((p) => ({ ...p, titre: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.title')}
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.description')}</label>
                        <textarea
                          className="border px-2 py-1 rounded w-full text-sm resize-none"
                          rows={2}
                          value={editData.description}
                          onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.description')}
                        />
                      </div>

                      {/* Prix */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.price')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          type="number"
                          value={editData.prix}
                          onChange={(e) => setEditData((p) => ({ ...p, prix: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.price')}
                        />
                      </div>

                      {/* Ville */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.city')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          value={editData.ville}
                          onChange={(e) => setEditData((p) => ({ ...p, ville: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.city')}
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.type')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          value={editData.type}
                          onChange={(e) => setEditData((p) => ({ ...p, type: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.type')}
                        />
                      </div>

                      {/* Surface */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.surface')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          type="number"
                          value={editData.surface}
                          onChange={(e) => setEditData((p) => ({ ...p, surface: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.surface')}
                        />
                      </div>

                      {/* Chambres */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.bedrooms')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          type="number"
                          value={editData.chambres}
                          onChange={(e) => setEditData((p) => ({ ...p, chambres: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.bedrooms')}
                        />
                      </div>

                      {/* Douches */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">{t('annonceList.editPlaceholders.showers')}</label>
                        <input
                          className="border px-2 py-1 rounded w-full text-sm"
                          type="number"
                          value={editData.douches}
                          onChange={(e) => setEditData((p) => ({ ...p, douches: e.target.value }))}
                          placeholder={t('annonceList.editPlaceholders.showers')}
                        />
                      </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <button onClick={() => saveEdit(annonce.id)} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                        ✓ {t('annonceList.actions.save')}
                      </button>
                      <button onClick={cancelEdit} className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium">
                        ✕ {t('annonceList.actions.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Mode affichage */
                  <>
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
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h2 className="font-semibold text-lg">{annonce.titre}</h2>
                        {annonce.description && <p className="text-sm text-gray-600 line-clamp-2">{annonce.description}</p>}
                        <p className="text-sm text-gray-500">{annonce.type}</p>
                        <p className="text-gray-700 font-medium">{annonce.prix} FCFA</p>
                        {annonce.ville && <p className="text-xs text-gray-500 flex items-center gap-1">  <FaMapMarkerAlt className="text-red-500" />{annonce.ville}</p>}
                        <div className="text-xs text-gray-500 flex gap-4 mt-1">
                          {annonce.surface && <span className="flex items-center gap-1"><FaRuler className="text-gray-600" />{annonce.surface}m²</span>}
                          {annonce.chambres && <span className="flex items-center gap-1"><FaBed className="text-gray-600" />{annonce.chambres} ch.</span>}
                          {annonce.douches && <span className="flex items-center gap-1"><FaShower className="text-gray-600" />{annonce.douches}</span>}
                        </div>
                      </div>

                      {/* Actions agent */}
                      {role === "AGENT" && (
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => startEdit(annonce)}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center justify-center gap-2">
                            <FaEdit /> {t('annonceList.actions.edit')}
                          </button>
                          <button onClick={() => deleteAnnonce(annonce.id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium flex items-center justify-center gap-2">
                            <FaTrash /> {t('annonceList.actions.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
          </li>
        ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
};

export default AnnonceList;
