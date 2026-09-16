import React, { useState, useContext } from "react";
import { useSignUp, useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import { signUpUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const VerificationCode = () => {
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const { updateUser } = useContext(AuthContext);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signUp?.attemptEmailAddressVerification({ code });

      if (result?.status === "complete") {
        await setActiveSignUp?.({ session: result?.createdSessionId });

        // Sync explicite avec la BDD locale via POST /auth/signup.
        // On attend cette étape AVANT d'annoncer le succès à l'utilisateur —
        // avant, elle partait en tâche de fond (setTimeout, sans await) et le
        // message "Compte vérifié" pouvait s'afficher avant même de savoir si
        // la sync avait marché.
        try {
          // user?.reload() force le SDK Clerk à relire les vraies métadonnées
          // qu'on vient d'enregistrer (signUp.create dans Inscription.tsx) —
          // sans ça, le `user` local peut encore contenir une version
          // périmée juste après la création du compte.
          await user?.reload();

          const token = await getToken();
          const meta = (user?.unsafeMetadata ?? {}) as {
            firstname?: string;
            role?: 'PROSPECT' | 'AGENT';
            phone?: string;
          };
          const clerkId = userId || user?.id;
          const firstname = meta.firstname || user?.firstName || '';
          const role = meta.role || 'PROSPECT';
          const phone = meta.phone || '';
          const email = user?.emailAddresses?.[0]?.emailAddress || '';

          if (clerkId && token && firstname && phone) {
            const sync = await signUpUser(clerkId, firstname, role, phone, token);
            console.debug('[VerificationCode] Sync BDD réussie :', sync?.user ?? sync);
            const dbUser = sync?.user ?? sync;
            updateUser({
              id: dbUser?.id,
              clerkId,
              firstname: dbUser?.firstname ?? firstname,
              email: dbUser?.email ?? email,
              role: dbUser?.role ?? role,
              phone: dbUser?.phone ?? phone,
            });
          } else {
            // On ne peuple PLUS AuthContext ici comme si tout allait bien :
            // sans confirmation réelle du backend, mieux vaut laisser le
            // contexte vide (les pages qui en ont besoin retombent sur les
            // données Clerk brutes) que de prétendre un succès qui n'a pas
            // eu lieu. Le webhook Clerk (/webhooks/clerk) reste le filet de
            // sécurité qui rattrapera la création en base de son côté.
            console.warn('[VerificationCode] Sync BDD ignorée : infos manquantes', {
              clerkId: !!clerkId, token: !!token, firstname: !!firstname, phone: !!phone,
            });
          }
        } catch (syncErr) {
          // Même logique : un échec réel de sync ne doit pas non plus
          // déclencher un faux succès local.
          console.warn('[VerificationCode] Échec sync BDD (le webhook Clerk prendra le relais) :', syncErr);
        }

        alert("Compte vérifié avec succès !");
        setTimeout(() => navigate(`/${lng}/dashboard`), 800);
      } else {
        alert("Code incorrect ou expiré. Réessaye !");
      }
    } catch (err) {
      console.error("❌ Erreur vérification Clerk:", err);
      alert("Une erreur est survenue lors de la vérification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-24 px-4 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
        Vérifie ton email
      </h2>
      <form
        onSubmit={handleVerification}
        className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6"
      >
        <p className="text-gray-700 text-center mb-4">
          Un code à 6 chiffres t’a été envoyé par email.
        </p>
        <input
          type="text"
          maxLength={6}
          placeholder="Entre ton code ici"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center tracking-widest text-lg"
        />

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Vérification..." : "Valider le code"}
        </button>
      </form>
    </div>
  );
};

export default VerificationCode;