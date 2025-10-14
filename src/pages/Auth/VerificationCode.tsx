import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";

const VerificationCode = () => {
  const { signUp, setActive: setActiveSignUp } = useSignUp();
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
        alert("Compte vérifié avec succès !");
        setTimeout(() =>navigate(`/${lng}/dashboard`), 800);
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
