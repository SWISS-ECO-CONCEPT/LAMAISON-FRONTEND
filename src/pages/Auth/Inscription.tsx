import { useFormik } from "formik";
import { t } from "i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";

const schemaSignUp = yup.object().shape({
  firstname: yup.string().min(2, "Prénom trop court").required("Prénom requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().min(6, "6 caractères minimum").required("Mot de passe requis"),
  role: yup.string().oneOf(["PROSPECT", "AGENT"], "Choisir un rôle").required("Rôle requis"),
});

const Inscription = () => {
  const { lng } = useParams<{ lng: string }>();
  const navigate = useNavigate();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  const [codeVerification, setCodeVerification] = useState("");

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

  // const handleSignUp = async (values: typeof initialValues) => {
  //   let setSubmitting = formik.setSubmitting;
  //   if (!signUp || !setActiveSignUp) {
  //     throw new Error('Issue while signing up');
  //   };

  //   // Création de l’utilisateur dans Clerk
  //   const result = {
  //     emailAddress: values.email,
  //     password: values.password,
  //     firstname: values.firstname,
  //     role: values.role,
  //   }

  //   try {
  //     await signUp.create(result);

  //     // Finalisation (l’utilisateur est connecté automatiquement après signup)
  //     // await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
  //     // await setActive({ session: result.createdSessionId });

  //     console.log("✅ Inscription Clerk réussie :", result);
  //     navigate(`/${lng}/dashboard`);
  //   } catch (error: any) {
  //     console.error("❌ Erreur Clerk", error.errors || error.message);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }
  const handleSignUp = async (values: typeof initialValues) => {
    const setSubmitting = formik.setSubmitting;
    if (!signUp || !setActiveSignUp) {
      throw new Error('Issue while signing up');
    }

    try {
      // Création de l’utilisateur dans Clerk
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        unsafeMetadata: {
          firstName: values.firstname,
          role: values.role
        }, // 🔥 rôle custom stocké côté Clerk
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true)
      alert("code envoyé à votre email")
     
    } catch (error: any) {
      console.error("❌ Erreur Clerk", error.errors || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerification = async () => {
    try{
      if(!signUp) return undefined;
      const completeAuth = await signUp.attemptVerification({
        strategy: 'email_code', 
        code: codeVerification,
      })
      if (completeAuth.status === 'complete') {
        await setActiveSignUp({ session: completeAuth.createdSessionId });
        console.log("✅ Inscription Clerk réussie :", completeAuth);
        navigate(`/${lng}/dashboard`);
      }
    } catch (error: any) {
      console.error("❌ Erreur Clerk", error.errors || error.message);
    }
  }

  if (verifying) {
    return (
      <div className="mt-24 px-4 max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
          {t("inscription.verifEmail")}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerification();
          }}
          className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6"
        >
          {/* Code de vérification */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              {t("inscription.codeEnvoye")}
            </label>
            <input
              type="text"
              name="code"
              value={codeVerification}
              onChange={(e) => setCodeVerification(e.target.value)}
              placeholder={t("inscription.entrCode")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {t("inscription.verifier")}
          </button>
        </form>
      </div>
    );
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
            {t("rdvModal.prenom")}
          </label>
          <input
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
            Email
          </label>
          <input
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
            {t("connexion.mdp")}
          </label>
          <input
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
            {t("inscription.jeSuis")}
          </label>
          <select
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
        >
          {t("inscription.inscrire")}
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
