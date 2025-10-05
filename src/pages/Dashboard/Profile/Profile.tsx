// src/pages/Dashboard/Profile/Profile.tsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // Ajout du hook Clerk

//  Définition du type UserProfile pour typer les données utilisateur
type UserProfile = {
  firstname: string;
  email: string;
  phone?: string;
  role: "AGENT" | "PROSPECT";
  avatar?: string; // URL ou base64
};

const Profile = () => {
  const { user } = useUser(); // Récupère l'utilisateur Clerk

  // Initialisation avec Clerk
  const [formData, setFormData] = useState<UserProfile>({
    firstname: user?.firstName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
    role: (user?.publicMetadata?.role as "AGENT" | "PROSPECT") || "PROSPECT",
    avatar: user?.imageUrl || "",
  });

  // Aperçu avatar
  const [preview, setPreview] = useState<string | null>(user?.imageUrl || null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstName || "",
        email: user.emailAddresses?.[0]?.emailAddress || "",
        phone: user.phoneNumbers?.[0]?.phoneNumber || "",
        role: (user.publicMetadata?.role as "AGENT" | "PROSPECT") || "PROSPECT",
        avatar: user.imageUrl || "",
      });
      setPreview(user.imageUrl || null);
    }
  }, [user]);

  //  Gestion des changements dans les champs texte du formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  Gestion du changement d’avatar (image uploadée)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string); // preview base64
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file); //  Conversion du fichier en base64
    }
  };

  //  Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici tu peux envoyer formData vers ton backend ou Clerk API
    console.log("Profil mis à jour :", formData);
    alert("Profil mis à jour avec succès !");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="relative">
          {preview ? (
            //  Affichage de l’avatar si disponible
            <img
              src={preview}
              alt="avatar"
              className="h-24 w-24 rounded-full object-cover border-2 border-green-600"
            />
          ) : (
            // Avatar mock
            <div className="h-24 w-24 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
              {formData.firstname[0] || "?"} {/* ✅ Première lettre du prénom */}
            </div>
          )}
          {/* Input caché pour uploader une image */}
          <label className="absolute bottom-0 right-0 bg-white border rounded-full p-1 cursor-pointer hover:bg-gray-100">
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <span className="text-xs text-green-600 font-semibold">📷</span>
          </label>
        </div>

        {/* Infos utilisateur */}
        <div>
          <h1 className="text-2xl font-bold">
            {formData.firstname}
          </h1>
          <p className="text-gray-600">
            {formData.role === "AGENT" ? "Agent Immobilier" : "Particulier"}
          </p>
          <p className="text-gray-500">{formData.email}</p>
        </div>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4"
      >
        {/* Nom */}
        <div>
          <label className="block text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
            readOnly
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-gray-700 mb-1">Téléphone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        {/* Mot de passe */}
        {/* <div>
          <label className="block text-gray-700 mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="********"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div> */}

        {/* Bouton */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;