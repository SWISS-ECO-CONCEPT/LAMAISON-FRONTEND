import { t } from 'i18next'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type RdvModalProps = {
  isOpen: boolean
  onClose: () => void
  proprietaireNom: string
  proprietaireId: number
  proprietaireTel: string
  annonceId: number
  datesSejour?: { startDate: Date | null, endDate: Date | null }
}

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
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [heure, setHeure] = useState<Date | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !heure) {
      toast.error('Veuillez sélectionner une date et une heure')
      return
    }

    // Combiner la date et l'heure
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

      const response = await fetch(`${'http://localhost:5000'}/api/rdvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateTime.toISOString(),
          prospectId: 1, // À remplacer par l'ID de l'utilisateur connecté
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
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'envoi du RDV')
      }

      await response.json()
      
      toast.success('Demande de RDV envoyée avec succès !')
      onClose()
      
      // Afficher les coordonnées du propriétaire
      toast.info(`Contactez le propriétaire au ${proprietaireTel} pour confirmer le RDV.`)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du RDV:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
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

