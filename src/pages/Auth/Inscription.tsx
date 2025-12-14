import { useFormik } from "formik";
import { t } from "i18next";
import { Link, useParams } from "react-router-dom";
import * as yup from "yup";
import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
import VerificationCode from "./VerificationCode";

const schemaSignUp = yup.object().shape({
  firstname: yup.string().min(2, "Prénom trop court").required("Prénom requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().min(6, "6 caractères minimum").required("Mot de passe requis"),
  role: yup.string().oneOf(["PROSPECT", "AGENT"], "Choisir un rôle").required("Rôle requis"),
});

const Inscription = () => {
  const { lng } = useParams<{ lng: string }>();
  // const navigate = useNavigate();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  // const [codeVerification, _setCodeVerification] = useState("");
  const [, setServerError] = useState<string | null>(null);
  const [, setInfoMessage] = useState<string | null>(null);
  const [, setEmailForVerification] = useState<string | null>(null);
  const [, setLastSentAt] = useState<number | null>(null);

  // Initial values
  const initialValues = {
    firstname: "",
    email: "",
    password: "",
    role: "",
  };

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema: schemaSignUp,
    onSubmit: (values) => {
      handleSignUp(values);
    },
    validateOnMount: false,
    validateOnBlur: true,
    validateOnChange: true,
  });





  const handleSignUp = async (values: typeof initialValues) => {
    setServerError(null);
    const setSubmitting = formik.setSubmitting;
    if (!signUp || !setActiveSignUp) {
      throw new Error('Issue while signing up')
    }

    try {
      // experience UX 
      setInfoMessage("Création du compte en cours…");

      // Création de l’utilisateur dans Clerk
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        unsafeMetadata: {
          firstname: values.firstname,
          role: values.role
        }, // rôle custom stocké côté Clerk
      });

      // prepare verification (email code)
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // store for the verification screen
      setEmailForVerification(values.email);
      setLastSentAt(Date.now());
      setVerifying(true)
      alert("code envoyé à votre email")
      setInfoMessage("Un code vient d'être envoyé à votre adresse e-mail.");
    } catch (error: unknown) {
      // Log the raw error for debugging
      console.error("Erreur Clerk", error);

      // user friendly messages
      let msg = "Erreur lors de la création du compte. Vérifiez vos informations et réessayez.";

      if (error instanceof Error) {
        msg = error.message || msg;
      } else if (typeof error === "object" && error !== null) {
        const err = error as { errors?: Array<{ longMessage?: string }>; message?: string };
        msg = err?.errors?.[0]?.longMessage || err?.message || msg;
      }

      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <VerificationCode />
    )
  }
  return (
    <div className="mt-24 px-4 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
        {t("inscription.cree")}
      </h2>

      <form
        onSubmit={formik.handleSubmit}
        className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6"
      >
        {/* Prénom */}
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
            {t("rdvModal.prenom")} <span className="text-gray-400">*</span>
          </label>
          <input
            id="firstname"
            type="text"
            name="firstname"
            value={formik.values.firstname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={t("inscription.entrPre")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {formik.errors.firstname && formik.touched.firstname && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.firstname}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-gray-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={t("inscription.entrEmail")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {formik.errors.email && formik.touched.email && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t("connexion.mdp")} <span className="text-gray-400">*</span>
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={t("inscription.creeMdp")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {formik.errors.password && formik.touched.password && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
          )}
        </div>

        {/* Rôle */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            {t("inscription.jeSuis")} <span className="text-gray-400">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-60"
            disabled={formik.isSubmitting}
          >
            <option value="">{t("inscription.choisirR")}</option>
            <option value="PROSPECT">{t("inscription.prospect")}</option>
            <option value="AGENT">{t("inscription.agent")}</option>
          </select>
          {formik.errors.role && formik.touched.role && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
          )}
        </div>

        <div id="clerk-captcha"></div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
          aria-busy={formik.isSubmitting}
        >
          {formik.isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span>Création en cours…</span>
            </>
          ) : (
            <span>{t("inscription.inscrire")}</span>
          )}
        </button>

        <p className="text-sm text-center text-gray-600">
          {t("inscription.acompte")}{" "}
          <Link to={`/${lng}/login`} className="text-green-600 hover:underline font-semibold">
            {t("connexion.clique")}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Inscription;





// import { t } from 'i18next'
// import React, { useStatel } from 'react'
// import { Link, useNavigate, useParams } from 'react-router-dom'

// interface FormData {
//   firstname: string
//   email: string
//   password: string
//   role: 'PROSPECT' | 'AGENT' | ''
// }

// const Inscription = () => {
//   const [form, setForm] = useState<FormData>({
//     firstname: '',
//     email: '',
//     password: '',
//     role: '',
//   })
//   const { lng } = useParams<{ lng: string }>();
//   const navigate = useNavigate();

//   // const handleForm = (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault()
//   //   console.log('form submitted', form)
//   // }
//   const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();


//     try {
//       const response = await fetch('http://localhost:5000/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form), // Assure-toi que `form` contient les bons champs (email, password, etc.)
//       });

//       // const contentType = response.headers.get('content-type');
//       // const isJson = contentType?.includes('application/json');
//       // const data = isJson ? await response.json() : null;

//       const data = await response.json();

//       if (response.ok) {
//         console.log('✅ Inscription réussie', data);
//         navigate(`/${lng}/login`);

//         // Exemple : redirection vers la page de connexion
//         // navigate('/login'); // si tu utilises react-router
//       } else {
//         const errorMessage = data?.message || 'Erreur inconnue côté serveur';
//         console.error('❌ Erreur d’inscription', errorMessage);
//       }
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error('🚨 Erreur réseau', error.message);
//       } else {
//         console.error('🚨 Erreur réseau', error);
//       }
//     }
//   };

//   //   const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();

//   //   try {
//   //     const response = await fetch('http://localhost:5000/auth/signup', {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify(form),
//   //     });

//   //     const data = await response.json();

//   //     if (response.ok) {
//   //       console.log('Inscription réussie', data);
//   //       // Rediriger vers la page de connexion ou dashboard
//   //     } else {
//   //       console.error('Erreur d’inscription', data.message);
//   //     }
//   //   } catch (error) {
//   //     console.error('Erreur réseau', error);
//   //   }
//   // };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
//     setForm(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   return (
//     <div className="mt-24 px-4 max-w-lg mx-auto">
//       <h2 className="text-3xl font-bold text-center mb-8 text-green-600">{t('inscription.cree')}</h2>

//       <form onSubmit={handleForm} className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6">
//         <div>
//           <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
//             {t('rdvModal.prenom')}
//           </label>
//           <input
//             type="text"
//             name="firstname"
//             id="firstname"
//             value={form.firstname}
//             onChange={handleChange}
//             required
//             placeholder={t('inscription.entrPre')}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//           />
//         </div>

//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             name="email"
//             id="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//             placeholder={t('inscription.entrEmail')}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//           />
//         </div>

//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//             {t('connexion.mdp')}
//           </label>
//           <input
//             type="password"
//             name="password"
//             id="password"
//             value={form.password}
//             onChange={handleChange}
//             required
//             placeholder={t('inscription.creeMdp')}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//           />
//         </div>

//         <div>
//           <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
//             {t('inscription.jeSuis')}
//           </label>
//           <select
//             name="role"
//             id="role"
//             value={form.role}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//           >
//             <option value="">{t('inscription.choisirR')}</option>
//             <option value="PROSPECT">{t('inscription.prospect')}</option>
//             <option value="AGENT">{t('inscription.agent')}</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
//         >
//           {t('inscription.inscrire')}
//         </button>
//         <p className="text-sm text-center text-gray-600">
//           {t('inscription.acompte')}{" "}
//           <Link to={`/${lng}/login`} className="text-green-600 hover:underline font-semibold">
//             {t('connexion.clique')}
//           </Link>
//         </p>

//       </form>
//     </div>
//   )
// }

// export default Inscription
