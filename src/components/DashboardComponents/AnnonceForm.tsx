// AnnonceForm.tsx
import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useTranslation } from 'react-i18next';

type FormObject = {
  titre: string;
  description: string;
  prix: string | number;
  ville: string;
  type: string;
  projet: string;
  surface: string | number;
  chambres: string | number;
  douches: string | number;
  images?: string[]; // URLs retournées par l'API d'images
};

const API_BASE = "http://localhost:5000";

const AnnonceForm: React.FC = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormObject>({
    titre: "",
    description: "",
    prix: "",
    ville: "",
    type: "maison",
    projet: "location", // Default to 'location'
    surface: "",
    chambres: "",
    douches: "",
    images: [],
  } as FormObject);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // fichiers choisis par l'utilisateur
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // object URLs pour preview local
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Met à jour previewUrls quand selectedFiles change, et nettoie les anciens object URLs
  useEffect(() => {
    // revoke old urls
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);

    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quand l'utilisateur choisit des fichiers dans l'input
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    // reset any previous URLs stored in formData (we'll re-upload when user clicks "Upload images" implicitly)
    setFormData((prev) => ({ ...prev, images: prev.images ?? [] }));
  };

  // Upload des images sélectionnées vers /images (un fichier par requête car ton router utilise upload.single("file"))
  // Cette fonction renvoie un tableau d'URLs (strings). Elle est appelée automatiquement avant l'envoi de l'annonce.
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    setIsUploadingImages(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error(t('annonceForm.errors.loginRequired'));

      // Upload en parallèle (Promise.all). Chaque requête envoie le champ 'file' car multer est configuré en upload.single("file")
      const uploadPromises = files.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file); // IMPORTANT: field name 'file' pour matcher upload.single("file")

        const res = await fetch(`${API_BASE}/images`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Ne pas mettre 'Content-Type' ici ; fetch le définit automatiquement pour FormData
          },
          body: fd,
          // credentials pas nécessaire sauf si ton serveur exige cookies et les gère
        });

        if (!res.ok) {
          // essaie d'extraire le message d'erreur du serveur
          const text = await res.text();
          throw new Error(
            text || `Erreur lors de l'upload de ${file.name} (status ${res.status})`
          );
        }

        // parsing JSON et robustesse quant au shape retourné
        const data = await res.json();
        // Accept common shapes: { url: '...' } ou { data: { url: '...' } }
        const url =
          (data && (data.url || (data.data && data.data.url))) ||
          // fallback: peut-être que le serveur retourne { path: 'uploads/...' }
          (data && (data.path || data.filePath)) ||
          null;

        if (!url) {
          // si ton backend renvoie un objet différent, log pour debug
          console.warn("Réponse inattendue lors de l'upload image:", data);
          throw new Error(t('annonceForm.errors.uploadError', { error: `Could not extract URL for ${file.name}` }));
        }

        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1) upload images (si il y en a) et récupérer leurs URLs
      let imageUrls: string[] = formData.images || [];
      if (selectedFiles.length > 0) {
        try {
          const uploaded = await uploadImages(selectedFiles);
          imageUrls = [...(imageUrls || []), ...uploaded];
          // met à jour le formData afin que l'aperçu côté UI reflète les URLs uploadées
          setFormData((prev) => ({ ...prev, images: imageUrls }));
        } catch (imgErr) {
          throw new Error(t('annonceForm.errors.uploadError', { error: (imgErr as Error).message }));
        }
      }

      // 2) construire le payload de l'annonce
      const payload = {
        titre: formData.titre,
        description: formData.description,
        prix: Number(formData.prix) || 0,
        ville: formData.ville,
        type: formData.type,
        projet: formData.projet, // Add projet type to payload
        surface: Number(formData.surface) || 0,
        chambres: Number(formData.chambres) || 0,
        douches: Number(formData.douches) || 0,
        images: imageUrls, // array d'URLs
      };

      // 3) récupérer token et clerkId
      const token = await getToken();
      if (!token) throw new Error(t('annonceForm.errors.loginRequired'));

      const clerkId = user?.id;
      if (!clerkId) throw new Error(t('annonceForm.errors.userNotFound'));

      // 4) envoi de l'annonce
      const res = await fetch(`${API_BASE}/annonces/${clerkId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // essaie de récupérer un message utile
        const text = await res.text();
        throw new Error(text || `Erreur serveur (${res.status})`);
      }

      // succès
      alert(t('annonceForm.errors.publishSuccess'));
      // reset simple du formulaire (optionnel : tu peux aussi rediriger)
      setFormData({
        titre: "",
        description: "",
        prix: "",
        ville: "",
        type: "maison",
        projet: "location",
        surface: "",
        chambres: "",
        douches: "",
        images: [],
      });
      setSelectedFiles([]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      console.error("Erreur publication annonce:", err);
      alert(`Erreur : ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('annonceForm.title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.titre')}</label>
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
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.description')}</label>
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
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.prix')}</label>
          <input
            type="number"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.ville')}</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.type')}</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            {Object.entries(t('annonceForm.fields.typeOptions', { returnObjects: true }) as Record<string, string>).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Projet Type */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.projetType')}</label>
          <select
            name="projet"
            value={formData.projet}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            {Object.entries(t('annonceForm.fields.projetTypeOptions', { returnObjects: true }) as Record<string, string>).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Surface */}
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

        {/* Chambres */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.chambres')}</label>
          <input
            type="number"
            name="chambres"
            value={formData.chambres}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            
          />
        </div>

        {/* Douches */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.douches')}</label>
          <input
            type="number"
            name="douches"
            value={formData.douches}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            
          />
        </div>

        {/* Upload images (choix) */}
        <div>
          <label className="block text-gray-700 mb-1">{t('annonceForm.fields.images')}</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelection}
            className="w-full border px-3 py-2 rounded-md"
          />

          {/* Aperçu local */}
          {previewUrls.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {previewUrls.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
              ))}
            </div>
          )}

          {/* Aperçu des URLs uploadées (si déjà uploadées) */}
          {formData.images && formData.images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">{t('annonceForm.fields.uploadedImages')}</p>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {formData.images.map((url, idx) => (
                  <img key={idx} src={url} alt={`uploaded-${idx}`} className="w-full h-24 object-cover rounded-md border" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
          disabled={isSubmitting || isUploadingImages}
        >
          {(isSubmitting || isUploadingImages) ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
              <span>{isSubmitting ? t('annonceForm.buttons.publishing') : t('annonceForm.buttons.uploading')}</span>
            </>
          ) : (
            t('annonceForm.buttons.publish')
          )}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default AnnonceForm;




// import React, { useState } from "react";
// import { useAuth, useUser } from "@clerk/clerk-react";

// type FormObject = {
//   titre: string;
//   description: string;
//   prix: string | number;
//   ville: string;
//   type: string;
//   surface: string | number;
//   chambres: string | number;
//   douches: string | number;
//   images?: string[];
// };

// const AnnonceForm: React.FC = () => {
//   const { getToken } = useAuth();
//   // const location = useLocation();
//   // const role = location.pathname.includes("prospect") ? "PROSPECT" : "AGENT";
//   const [formData, setFormData] = useState<FormObject>({
//     titre: "",
//     description: "",
//     prix: "",
//     ville: "",
//     type: "",
//     surface: "",
//     chambres: "",
//     douches: ""
//   } as FormObject);

//   const [images, setImages] = useState<File[]>([]); // stockage des fichiers
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     console.log(formData);
//   };

//   // Gestion upload images
//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length) return;
    
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       const token = await getToken();
//       if (!token) {
//         throw new Error("Vous devez être connecté pour uploader des images");
//       }

//       const selectedFiles = Array.from(e.target.files);
//       const uploadedUrls: string[] = [];

//       // Upload each image
//       for (const file of selectedFiles) {
//         const formData = new FormData();
//         formData.append('image', file);

//         const uploadRes = await fetch('http://localhost:5000/images', {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           },
//           body: formData
//         });

//         if (!uploadRes.ok) {
//           throw new Error(`Erreur lors de l'upload de l'image: ${file.name}`);
//         }

//         const imageData = await uploadRes.json();
//         uploadedUrls.push(imageData.url);
//       }

//       // Store the files for preview
//       setImages(selectedFiles);
      
//       // Update form data with image URLs
//       setFormData(prev => ({
//         ...prev,
//         images: uploadedUrls
//       }));

//     } catch (err) {
//       console.error("Erreur lors de l'upload des images:", err);
//       const errMsg = err instanceof Error ? err.message : "Erreur inconnue lors de l'upload";
//       setError(errMsg);
//       alert(errMsg);
//       // Clear the file input
//       e.target.value = '';
//       setImages([]);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Get Clerk user object (contains clerk user id)
//   const { user } = useUser();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setIsSubmitting(true);

//     // Build JSON payload (we'll pass Clerk id as route param)
//     const payload = {
//       titre: formData.titre,
//       description: formData.description,
//       prix: Number(formData.prix) || 0,
//       ville: formData.ville,
//       type: formData.type,
//       surface: Number(formData.surface) || 0,
//       chambres: Number(formData.chambres) || 0,
//       douches: Number(formData.douches) || 0,
//       images: formData.images || []
//     };

//     try {
//       // Get the session token from Clerk
//       const token = await getToken();

//       if (!token) {
//         throw new Error("Vous devez être connecté pour créer une annonce");
//       }

//       const clerkId = user?.id;
//       if (!clerkId) throw new Error('Utilisateur Clerk introuvable, reconnectez-vous');

//       const res = await fetch(`http://localhost:5000/annonces/${clerkId}`, {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         credentials: 'include',
//         body: JSON.stringify(payload),
//       });
//       console.log("payload", payload);
//       console.log("clerkId", clerkId);
//       if (!res.ok) {
//         // essaie d'extraire le message d'erreur renvoyé par le serveur
//         const text = await res.text();
//         throw new Error(text || `Erreur serveur (${res.status})`);
//       }

//       alert("Annonce publiée avec succès");
//     } catch (err: unknown) {
//       console.error("Erreur lors de l'envoi de l'annonce:", err);
//       // Extraire le message de façon sûre depuis un unknown
//       const errMsg =
//         err instanceof Error ? err.message : typeof err === "string" ? err : "Erreur inconnue";
//       setError(errMsg);
//       alert(`Erreur : ${errMsg}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 shadow-md rounded-lg max-w-xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">
//         Publier une annonce (AGENT)
//       </h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Titre */}
//         <div>
//           <label className="block text-gray-700 mb-1">Titre</label>
//           <input
//             type="text"
//             name="titre"
//             value={formData.titre}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             required
//           />
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block text-gray-700 mb-1">Description</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             rows={4}
//             required
//           />
//         </div>

//         {/* Prix */}
//         <div>
//           <label className="block text-gray-700 mb-1">Prix (FCFA)</label>
//           <input
//             type="number"
//             name="prix"
//             value={formData.prix}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             required
//           />
//         </div>

//         {/*Ville*/}
//         <div>
//           <label className="block text-gray-700 mb-1">Ville</label>
//           <input
//             type="text"
//             name="ville"
//             value={formData.ville}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             required
//           />
//         </div>


//         {/* Type de bien */}
//         <div>
//           <label className="block text-gray-700 mb-1">Type de bien</label>
//           <select
//             name="type"
//             value={formData.type}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//           >
//             <option value="maison">Maison</option>
//             <option value="appartement">Appartement</option>
//             <option value="terrain">Terrain</option>
//             <option value="chambre">Chambre</option>
//             <option value="meublé">Meublé</option>
//           </select>
//         </div>

//         {/* Surface*/}
//         <div>
//           <label className="block text-gray-700 mb-1">Surface</label>
//           <input
//             type="number"
//             name="surface"
//             value={formData.surface}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             required
//           />
//         </div>

//         {/* Chambre*/}
//         <div>
//           <label className="block text-gray-700 mb-1">Chambre</label>
//           <input
//             type="number"
//             name="chambres"
//             value={formData.chambres}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             required
//           />
//         </div>

//         {/* Douche*/}
//         <div>
//           <label className="block text-gray-700 mb-1">Douche</label>
//           <input
//             type="number"
//             name="douches"
//             value={formData.douches}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded-md"
//             required
//           />
//         </div>

//         {/* Upload Images */}
//         <div>
//           <label className="block text-gray-700 mb-1">Images du bien</label>
//           <input
//             type="file"
//             multiple
//             accept="image/*"
//             onChange={handleImageChange}
//             className="w-full border px-3 py-2 rounded-md"
//           />
//           {/* Aperçu des images */}
//           {images.length > 0 && (
//             <div className="mt-2 grid grid-cols-3 gap-2">
//               {images.map((file, index) => (
//                 <img
//                   key={index}
//                   src={URL.createObjectURL(file)}
//                   alt={`preview-${index}`}
//                   className="w-full h-24 object-cover rounded-md border"
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Bouton */}
//         <button
//           type="submit"
//           className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-60"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "Publication…" : "Publier"}
//         </button>
//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default AnnonceForm;
