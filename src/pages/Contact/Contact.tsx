import { t } from 'i18next'
import React, { useState } from 'react'
import * as Yup from 'yup'

interface ContactForm {
  nom: string
  email: string
  message: string
}


// Définition du schéma de validation avec Yup
const contactSchema = Yup.object().shape({
  nom: Yup.string()
    .required("Le nom est obligatoire"),
  email: Yup.string()
    .email("Email invalide")
    .required("L'email est obligatoire"),
  message: Yup.string()
    .min(10, "Le message doit faire au moins 10 caractères")
    .required("Le message est obligatoire"),
})


const Contact = () => {
  const [form, setForm] = useState<ContactForm>({
    nom: '',
    email: '',
    message: ''
  })

  const [errors, setErrors] = useState<Partial<ContactForm>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
     try {
         // Validation avec Yup
      await contactSchema.validate(form, { abortEarly: false })
    console.log('Message envoyé !', form)
    // Optionnel : envoi vers backend ou API email

     setErrors({}) // reset des erreurs
    } catch (err) {
      // Si Yup renvoie des erreurs, on les mappe dans notre state errors
      const newErrors: Partial<ContactForm> = {}
      
      if (err && typeof err === 'object' && 'inner' in err) {
        const yupError = err as {
          inner: Array<{
            path: string
            message: string
          }>
        }
        
        yupError.inner.forEach((e) => {
          if (e.path in form) {
            newErrors[e.path as keyof ContactForm] = e.message
          }
        })
      } else {
        console.error('Erreur de validation inattendue:', err)
      }
      
      setErrors(newErrors)
    }
  }

  return (
    <div className="mt-24 px-4 max-w-xl mx-auto text-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-600">{t('contact.contact')}</h2>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl px-8 py-10 space-y-6">
        
        <div>
          <label htmlFor="nom" className="block text-sm font-medium mb-1">
            {t('rdvModal.nom')} <span className="text-gray-400">*</span>
          </label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            
            placeholder={t('contact.comN')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:outline-none focus:border-green-500"
          />
          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span className="text-gray-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            
            placeholder={t('contact.Vemail')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:outline-none focus:border-green-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message <span className="text-gray-400">*</span>
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            
            rows={4}
            placeholder={t('contact.expN')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:outline-none focus:border-green-500"
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
        >
          {t('contact.envyM')}
        </button>
      </form>
    </div>
  )
}

export default Contact
