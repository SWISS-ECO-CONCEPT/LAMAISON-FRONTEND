import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import { useAuth, useUser } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FaCheckCircle, FaCalendarAlt, FaPhoneAlt, FaClock, FaUserTie } from 'react-icons/fa'

type RdvModalProps = {
  isOpen: boolean
  onClose: () => void
  proprietaireNom: string
  proprietaireId: number
  proprietaireTel: string
  annonceId: number
  datesSejour?: { startDate: Date | null, endDate: Date | null }
}

import { API_BASE } from '../config/api';

const RdvModal: React.FC<RdvModalProps> = ({
  isOpen,
  onClose,
  proprietaireNom,
  proprietaireId,
  proprietaireTel,
  annonceId,
  datesSejour,
}) => {
  const { getToken } = useAuth()
  const { user} = useUser()
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [heure, setHeure] = useState<Date | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successState, setSuccessState] = useState<null | { dateIso: string; createdId?: number }>(null)

  useEffect(() => {
    if (!isOpen) {
      setNom('')
      setPrenom('')
      setEmail('')
      setTel('')
      setDate(null)
      setHeure(null)
      setMessage('')
      setIsLoading(false)
      setSuccessState(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !heure) {
      toast.error('Veuillez sélectionner une date et une heure')
      return
    }

    const dateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      heure.getHours(),
      heure.getMinutes()
    )

    setIsLoading(true)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Non authentifié')
      }
      const response = await fetch(`${API_BASE}/rdvs`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          date: dateTime.toISOString(),
          prospectClerkId: user?.id,
          annonceId: annonceId, 
          message,
          nom,
          prenom,
          email,
          telephone: tel,
          proprietaireId: proprietaireId
        })
      })

      if (!response.ok) {
        let errorMsg = `Erreur lors de l'envoie du RDV`;
        try {
          const errJson = await response.json();
          errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
        } catch {
          try {
            const text = await response.text();
            if (text) errorMsg = text;
          } catch { /* empty */ }
        }
        throw new Error(errorMsg);
      }

      let createdSuccessfully = true;
      let createdId: number | undefined = undefined;
      try {
        const json = await response.json();
        if (json && typeof json === 'object' && 'success' in json) {
          createdSuccessfully = !!json.success;
          const innerData = json?.data ?? json;
          if (innerData && typeof innerData === 'object' && 'id' in innerData) {
            createdId = (innerData as { id: number }).id;
          }
        }
      } catch { /* empty */ }

      if (createdSuccessfully) {
        toast.success('Demande de RDV envoyée avec succès !')
        setSuccessState({ dateIso: dateTime.toISOString(), createdId })
      } else {
        throw new Error('Le serveur a répondu sans succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du RDV:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
      setIsLoading(false)
    } finally { /* empty */ }
  }

  const handleClose = () => {
    onClose()
  }

  if (successState) {
    const d = new Date(successState.dateIso)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-10 flex flex-col items-center text-white">
            <FaCheckCircle className="text-white mb-4 drop-shadow-md" size={64} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center">
              Rendez-vous pris avec succès !
            </h2>
            <p className="mt-2 text-green-50/90 text-center text-sm sm:text-base">
              Votre demande a été envoyée à <span className="font-semibold">{proprietaireNom}</span>
            </p>
            {successState.createdId !== undefined && (
              <p className="mt-1 text-xs text-green-50/75 font-mono">
                Référence RDV #{successState.createdId}
              </p>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-3">
                <FaCalendarAlt className="text-green-600 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-green-700/80 font-semibold">
                    Date
                  </p>
                  <p className="text-gray-800 font-bold text-sm sm:text-base">
                    {format(d, 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-3">
                <FaClock className="text-green-600 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-green-700/80 font-semibold">
                    Heure
                  </p>
                  <p className="text-gray-800 font-bold text-sm sm:text-base">
                    {format(d, 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>

            {datesSejour?.startDate && datesSejour?.endDate && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                📆 <span className="font-semibold text-blue-900">{t('rdvModal.sejour')} :</span>{' '}
                <span className="text-gray-800">
                  du <b>{format(datesSejour.startDate, 'dd/MM/yyyy')}</b> au{' '}
                  <b>{format(datesSejour.endDate, 'dd/MM/yyyy')}</b>
                </span>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 flex items-center gap-2">
                <FaUserTie className="text-gray-600" size={14} />
                Pour confirmer, contactez
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{proprietaireNom}</p>
                  <a
                    href={`tel:${proprietaireTel}`}
                    className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800 font-semibold mt-0.5"
                  >
                    <FaPhoneAlt size={14} />
                    {proprietaireTel}
                  </a>
                </div>
                <a
                  href={`tel:${proprietaireTel}`}
                  className="shrink-0 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                >
                  Appeler
                </a>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              💡 <b>Note :</b> {proprietaireNom} recevra une notification. Confirmez le créneau par
              téléphone pour éviter tout malentendu.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg transition"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose()
                  setTimeout(() => {
                    const currentLang = window.location.pathname.split('/')[1] || 'fr'
                    window.location.href = `/${currentLang}/dashboard/prospect/rdv`
                  }, 100)
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm"
              >
                Voir mes RDV
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          &times;
        </button>

        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
          {t('rdvModal.pdrRDV')} <span className="text-green-600">{proprietaireNom}</span>
        </h3>

        {/* ✅ Bloc Dates Séjour avec format() */}
        {datesSejour?.startDate && datesSejour?.endDate && (
          <div className="text-sm mb-4 text-center text-gray-700">
            📆 {t('rdvModal.sejour')} :{' '}
            <b>{format(datesSejour.startDate, 'dd/MM/yyyy')}</b> ➜{' '}
            <b>{format(datesSejour.endDate, 'dd/MM/yyyy')}</b>
          </div>
        )}

        {/* Formulaire RDV */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t('rdvModal.nom')}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              placeholder={t('rdvModal.prenom')}
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder={t('rdvModal.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="tel"
              placeholder={t('rdvModal.tel')}
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              selected={date}
              onChange={(val) => setDate(val)}
              dateFormat="dd/MM/yyyy"
              placeholderText={t('rdvModal.dte')}
              className="border p-2 rounded w-full"
              required
            />
            <DatePicker
              selected={heure}
              onChange={(val) => setHeure(val)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption={t('rdvModal.heure')}
              dateFormat="HH:mm"
              placeholderText={t('rdvModal.heureRdv')}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <textarea
            placeholder={t('rdvModal.msg')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 rounded w-full"
            rows={4}
          />
        
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Envoi en cours...' : t('rdvModal.envy')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RdvModal

