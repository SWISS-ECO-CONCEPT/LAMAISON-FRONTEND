import { t } from 'i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import React, { useState } from 'react';
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const { isLoaded, signIn } = useSignIn();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email('Email invalide').required('Email requis'),
  });

  const handleSubmit = async (values: { email: string }) => {
    if (!isLoaded) return;
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: values.email,
      });

      // Si le mail est bien envoyé  redirection vers /reset-password
      setMessage("Un code à 6 chiffres vous a été envoyé par e-mail");
      navigate("/reset-password", { state: { email: values.email } });

    } catch (err: any) {
      console.error("Erreur Clerk:", err);
      setMessage(err.errors?.[0]?.message || "Erreur réseau");
    }
  };

  return (
    <div className="mt-24 px-4 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
        {t('forgotPassword.titre')}
      </h2>

      <Formik initialValues={{ email: '' }} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="bg-white shadow-xl rounded-2xl px-8 py-10 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('forgotPassword.label')}
              </label>
              <Field
                type="email"
                name="email"
                placeholder={t('forgotPassword.placeholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {t('forgotPassword.bouton')}
            </button>

            {message && (
              <p className="text-sm text-center text-green-600 mt-2 animate-fade-in">
                {message}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPassword;






