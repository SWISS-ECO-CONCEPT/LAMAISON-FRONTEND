import { t } from 'i18next'
// import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { useFormik, type FormikHelpers } from 'formik';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { FaGoogle } from 'react-icons/fa';

const schemaSignIn = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Connexion = () => {
  const { lng } = useParams<{ lng: string }>();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const redirectUrl = `/${lng}/dashboard`;

  const initialValues = {
    email: '',
    password: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema: schemaSignIn,
    onSubmit: (values, formikHelpers) => { handleLogin(values, formikHelpers) },
    validateOnMount: false,
    validateOnBlur: true,
    validateOnChange: true,

  });

  const navTo = useNavigate();

  // const handleLogin = async (values: typeof initialValues, formikHelpers: FormikHelpers<typeof initialValues>) => {
  //   formikHelpers.setSubmitting(true);
  //   if (!signIn || !setActiveSignIn) {
  //     throw new Error('Issue while signing in');
  //   }
  //   await signIn.create({
  //     identifier: values.email,
  //     password: values.password,
  //     redirectUrl: redirectUrl
  //   }).then((result) => {
  //     if (result.status === 'complete') {
  //       setActiveSignIn({ session: result.createdSessionId })
  //       alert('You are now signed in!');
  //       navTo(redirectUrl);
  //     }
  //   }).catch((err) => {
  //     console.error('Error during sign-in:', err);
  //     alert('Failed to sign in. Please check your credentials and try again.');
  //   });
  // };
const handleLogin = async (values: typeof initialValues, formikHelpers: FormikHelpers<typeof initialValues>) => {
  formikHelpers.setSubmitting(true);
  if (!signIn || !setActiveSignIn) {
    throw new Error('Issue while signing in');
  }
  try {
    const result = await signIn.create({
      identifier: values.email,
      password: values.password,
    });

    if (result.status === 'complete') {
      await setActiveSignIn({ session: result.createdSessionId });
      alert('You are now signed in!');
      navTo(redirectUrl);
    } else {
      alert('Veuillez compléter la connexion');
    }
  } catch (err: any) {
    console.error('Error during sign-in:', err);
    alert('Failed to sign in. Please check your credentials and try again.');
  } finally {
    formikHelpers.setSubmitting(false);
  }
};

  const handleLoginWithGoogle = async (
    strategy: 'oauth_google',
  ) => {
    if (!signIn || !signUp) return undefined;

    const userExistsButNeedsToSignIn =
      signUp.verifications.externalAccount.status === 'transferable' &&
      signUp.verifications.externalAccount.error?.code ===
      'external_account_exists';

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });

      if (res.status === 'complete') {
        setActiveSignUp({
          session: res.createdSessionId,
        });
      }
    }

    const userNeedsToBeCreated =
      signIn.firstFactorVerification.status === 'transferable';

    if (userNeedsToBeCreated) {
      const res = await signUp.create({ transfer: true });

      if (res.status === 'complete') {
        return setActiveSignUp({ session: res.createdSessionId });
      }
      return undefined;
    } else {
      return signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: redirectUrl,
      });
    }
  }
  return (
    <div className="mt-24 px-4 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-600">{t('connexion.connexion')}</h2>
      <div className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange('email')}
              placeholder={t('connexion.vmail')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
            {formik.errors.email && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('connexion.mdp')}</label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange('password')}
              placeholder={t('connexion.Vmdp')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
            {formik.errors.password && formik.touched.password && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>
          <div className="text-right">
            <Link
              to={`/${lng}/forgot-password`}
              className="text-sm text-green-600 hover:underline font-medium"
            >
              {t('connexion.mdpOublie')}
            </Link>
          </div>


          <button
            type="submit"
            disabled={formik.isSubmitting}
            onClick={() => formik.handleSubmit()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {t('connexion.seConn')}
          </button>

        <div className="p-1.5 flex gap-3 text-sm text-center items-center justify-center text-gray-600">Connectez-vous avec Google
          <button
            onClick={() => handleLoginWithGoogle('oauth_google')}
            className="cursor-pointer text-xl"
          >
            <FaGoogle />
            {/*  <img src="" alt="Google" className="w-6 h-6"/> */}
          </button>
        </div>
        <p className="text-sm text-center text-gray-600">
          {t('connexion.pasCompte')}{" "}
          <Link to={`/${lng}/signup`} className="text-green-600 hover:underline font-semibold">
         {t('connexion.clique')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Connexion   



// import { t } from 'i18next'
// import React, { useContext, useState } from 'react'
// import { Link, useNavigate, useParams } from 'react-router-dom'
// import { AuthContext } from '../../context/AuthContext'

// interface LoginForm {
//   email: string
//   password: string
// }

// const Connexion = () => {
//   const [form, setForm] = useState<LoginForm>({
//     email: '',
//     password: ''
//   })
//   const { lng } = useParams<{ lng: string }>();

//   const { updateUser } = useContext(AuthContext)
//   const navigate = useNavigate()

//   // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//   //     e.preventDefault()
//   //     console.log('Login attempt', form)
//   //     // on pourra ensuite envoyer les données au backend
//   // }
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('http://localhost:5000/auth/signin', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form), // Assure-toi que `form` contient email et password
//       });

//       // const contentType = response.headers.get('content-type');
//       // const isJson = contentType?.includes('application/json');

//       // const data = isJson ? await response.json() : null;

//       const data = await response.json();

//       if (response.ok) {
//         console.log('✅ Connexion réussie', data);

//         // Exemple : stockage du token
//         if (data?.token) {
//           localStorage.setItem('token', data.token);
//         }
//         if (data?.user) {
//           localStorage.setItem('user', JSON.stringify(data.user));
//         }
//         updateUser(data.user)
//         if (data?.user?.role === 'AGENT') {
//           navigate(`/${lng}/dashboard/agent`);
//         } else if (data?.user?.role === 'PROSPECT') {
//           navigate(`/${lng}/dashboard/prospect`);
//         }
//         // Exemple : redirection
//         // navigate('/dashboard'); // si tu utilises react-router
//       } else {
//         const errorMessage = data?.message || 'Erreur inconnue côté serveur';
//         console.error('❌ Erreur de connexion', errorMessage);
//       }
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error('🚨 Erreur réseau', error.message);
//       } else {
//         console.error('🚨 Erreur réseau', error);
//       }
//     }
//   };

//   //     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();

//   //   try {
//   //     const response = await fetch('http://localhost:5000/auth/signin', {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify(form),
//   //     });

//   //     const data = await response.json();

//   //     if (response.ok) {
//   //       console.log('Connexion réussie', data);
//   //       // Stocker le token si tu en reçois un
//   //       // Rediriger vers une page protégée
//   //     } else {
//   //       console.error('Erreur de connexion', data.message);
//   //     }
//   //   } catch (error) {
//   //     console.error('Erreur réseau', error);
//   //   }
//   // };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setForm(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }
//   return (
//     <div className="mt-24 px-4 max-w-lg mx-auto">
//       <h2 className="text-3xl font-bold text-center mb-8 text-green-600">{t('connexion.connexion')}</h2>

//       <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6">
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//             placeholder={t('connexion.vmail')}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//           />
//         </div>

//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('connexion.mdp')}</label>
//           <input
//             type="password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             required
//             placeholder={t('connexion.Vmdp')}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//           />
//         </div>
//         <div className="text-right">
//           <Link
//             to={`/${lng}/forgot-password`}
//             className="text-sm text-green-600 hover:underline font-medium"
//           >
//             {t('connexion.mdpOublie')}
//           </Link>
//         </div>


//         <button
//           type="submit"
//           className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
//         >
//           {t('connexion.seConn')}
//         </button>
//         <p className="text-sm text-center text-gray-600">
//           {t('connexion.pasCompte')}{" "}
//           <Link to={`/${lng}/signup`} className="text-green-600 hover:underline font-semibold">
//             {t('connexion.clique')}
//           </Link>
//         </p>

//       </form>
//     </div>
//   )
// }

// export default Connexion