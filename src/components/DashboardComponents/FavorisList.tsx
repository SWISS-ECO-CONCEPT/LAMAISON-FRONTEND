import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import AnnonceCard from "../AnnonceCard";

const API_BASE = "http://localhost:5000";

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
    chambres?: number | null;
    douches?: number | null;
    surface?: number | null;
    projet?: 'achat' | 'location';
  };
};

const FavorisList: React.FC = () => {
  const { t } = useTranslation();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [favoris, setFavoris] = useState<Favori[]>([]);
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


  if (!isSignedIn) {
    return (
      <div className="p-4 text-center text-gray-700">
        <p>{t('favoris.loginRequired')}</p>
      </div>
    );
  }

  if (loading) return <div className="p-4 text-center">{t('common.loading')}</div>;
  if (error) return <div className="p-4 text-red-600">{t('common.error')}: {error}</div>;
  if (!favoris.length) return <div className="p-4 text-gray-500 text-center">{t('favoris.noFavorites')}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('favoris.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoris.map((fav) => (
          <AnnonceCard
            key={fav.id}
            id={fav.annonce.id}
            titre={fav.annonce.titre}
            ville={fav.annonce.ville || ''}
            prix={fav.annonce.prix}
            images={fav.annonce.images}
            chambres={fav.annonce.chambres || 0}
            douches={fav.annonce.douches || 0}
            surface={fav.annonce.surface || 0}
            projet={fav.annonce.projet || 'achat'}
          />
        ))}
      </div>
    </div>
  );
};

export default FavorisList;

