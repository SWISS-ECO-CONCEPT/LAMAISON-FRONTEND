import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import {  useNavigate, useParams } from "react-router-dom";

// Schéma de validation Yup
const ResetPasswordSchema = Yup.object().shape({
  code: Yup.string()
    .required("Le code de vérification est requis")
    .length(6, "Le code doit contenir 6 chiffres"),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const ResetPassword: React.FC = () => {
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useClerk();
  const navigate = useNavigate();
  // const location = useLocation();
  const { lng } = useParams<{ lng: string }>();

  const [serverMessage, setServerMessage] = React.useState("");

  //  Initialisation de Formik
  const formik = useFormik({
    initialValues: {
      code: "",
      password: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!isLoaded) return;

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: values.code,
          password: values.password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          setServerMessage("Mot de passe réinitialisé avec succès ");

          // Petit délai avant redirection pour UX
          setTimeout(() => navigate(`/${lng}/dashboard`), 800);
        } else {
          setServerMessage("Une étape est manquante.");
        }
      } catch (err: any) {
        console.error("Erreur:", err);
        setServerMessage(err.errors?.[0]?.message || "Code invalide ou expiré.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="mt-24 px-4 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-600">
        Réinitialisation du mot de passe
      </h2>

      <form
        onSubmit={formik.handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 space-y-4"
      >
        {/* Champ code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code de vérification
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
              formik.touched.code && formik.errors.code
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-green-500"
            }`}
            placeholder="6 chiffres reçus par email"
          />
          {formik.touched.code && formik.errors.code && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.code}</p>
          )}
        </div>

        {/* Champ mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
              formik.touched.password && formik.errors.password
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-green-500"
            }`}
            placeholder="Nouveau mot de passe"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className={`w-full text-white font-semibold py-3 rounded-lg transition ${
            formik.isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {formik.isSubmitting ? "Traitement..." : "Réinitialiser le mot de passe"}
        </button>

        {/* Message serveur */}
        {serverMessage && (
          <p
            className={`text-center text-sm mt-2 ${
              serverMessage.includes("succès") ? "text-green-600" : "text-red-600"
            }`}
          >
            {serverMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
