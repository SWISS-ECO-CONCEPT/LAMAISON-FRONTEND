import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

type FormObject = {
  titre: string;
  description: string;
  prix: string | number;
  ville: string;
  type: string;
  surface: string | number;
  chambres: string | number;
  douches: string | number;
  images?: string[];
};

const AnnonceForm: React.FC = () => {
  const { getToken } = useAuth();
  // const location = useLocation();
  // const role = location.pathname.includes("prospect") ? "PROSPECT" : "AGENT";
  const [formData, setFormData] = useState<FormObject>({
    titre: "",
    description: "",
    prix: "",
    ville: "",
    type: "",
    surface: "",
    chambres: "",
    douches: ""
  } as FormObject);

  const [images, setImages] = useState<File[]>([]); // stockage des fichiers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  // Gestion upload images
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour uploader des images");
      }

      const selectedFiles = Array.from(e.target.files);
      const uploadedUrls: string[] = [];

      // Upload each image
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);

        const uploadRes = await fetch('http://localhost:5000/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error(`Erreur lors de l'upload de l'image: ${file.name}`);
        }

        const imageData = await uploadRes.json();
        uploadedUrls.push(imageData.url);
      }

      // Store the files for preview
      setImages(selectedFiles);
      
      // Update form data with image URLs
      setFormData(prev => ({
        ...prev,
        images: uploadedUrls
      }));

    } catch (err) {
      console.error("Erreur lors de l'upload des images:", err);
      const errMsg = err instanceof Error ? err.message : "Erreur inconnue lors de l'upload";
      setError(errMsg);
      alert(errMsg);
      // Clear the file input
      e.target.value = '';
      setImages([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get Clerk user object (contains clerk user id)
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Build JSON payload (we'll pass Clerk id as route param)
    const payload = {
      titre: formData.titre,
      description: formData.description,
      prix: Number(formData.prix) || 0,
      ville: formData.ville,
      type: formData.type,
      surface: Number(formData.surface) || 0,
      chambres: Number(formData.chambres) || 0,
      douches: Number(formData.douches) || 0,
      images: formData.images || []
    };

    try {
      // Get the session token from Clerk
      const token = await getToken();

      if (!token) {
        throw new Error("Vous devez être connecté pour créer une annonce");
      }

      const clerkId = user?.id;
      if (!clerkId) throw new Error('Utilisateur Clerk introuvable, reconnectez-vous');

      const res = await fetch(`http://localhost:5000/annonces/${clerkId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      console.log("payload", payload);
      console.log("clerkId", clerkId);
      if (!res.ok) {
        // essaie d'extraire le message d'erreur renvoyé par le serveur
        const text = await res.text();
        throw new Error(text || `Erreur serveur (${res.status})`);
      }

      alert("Annonce publiée avec succès");
    } catch (err: unknown) {
      console.error("Erreur lors de l'envoi de l'annonce:", err);
      // Extraire le message de façon sûre depuis un unknown
      const errMsg =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Erreur inconnue";
      setError(errMsg);
      alert(`Erreur : ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Publier une annonce (AGENT)
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
        <div>
          <label className="block text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            rows={4}
            required
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-gray-700 mb-1">Prix (FCFA)</label>
          <input
            type="number"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/*Ville*/}
        <div>
          <label className="block text-gray-700 mb-1">Ville</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>


        {/* Type de bien */}
        <div>
          <label className="block text-gray-700 mb-1">Type de bien</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
            <option value="chambre">Chambre</option>
            <option value="meublé">Meublé</option>
          </select>
        </div>

        {/* Surface*/}
        <div>
          <label className="block text-gray-700 mb-1">Surface</label>
          <input
            type="number"
            name="surface"
            value={formData.surface}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Chambre*/}
        <div>
          <label className="block text-gray-700 mb-1">Chambre</label>
          <input
            type="number"
            name="chambres"
            value={formData.chambres}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Douche*/}
        <div>
          <label className="block text-gray-700 mb-1">Douche</label>
          <input
            type="number"
            name="douches"
            value={formData.douches}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Upload Images */}
        <div>
          <label className="block text-gray-700 mb-1">Images du bien</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border px-3 py-2 rounded-md"
          />
          {/* Aperçu des images */}
          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {images.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publication…" : "Publier"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default AnnonceForm;
