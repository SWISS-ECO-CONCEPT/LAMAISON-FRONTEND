import { t } from 'i18next'
import React from 'react'
// import DateSejourPicker from './DateSejourPicker'

interface OwnerCardProps {
  nom: string
  tel: string
  email?: string
  type: 'AGENT' | 'PROSPECT'
  // avatar?: string
  // agence?: string
  onPrendre?: () => void

  isMeuble?: boolean
  onChangeDates?: (dates: { startDate: Date | null; endDate: Date | null }) => void
}

const OwnerCard: React.FC<OwnerCardProps> = ({
  nom,
  // tel,
  email,
  type,
  // avatar,
  // agence,
  onPrendre,
  

}) => {
  const badgeColor =
    type === 'AGENT' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'

  return (
    <div className="bg-white border rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition duration-300">
      {/* Avatar + Infos */}
      <div className="flex items-center gap-4">
        {/* <img
          src={avatar || '/avatars/default-user.png'}
          alt={nom}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
        /> */}

        <div>
          <h4 className="text-lg font-semibold text-gray-800">{nom}</h4>

          <span
            className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${badgeColor}`}
          >
            {type === 'AGENT' ? t('ownerCard.agent') : t('ownerCard.prospect')}
          </span>

          {/* {agence && (
            <p className="text-sm text-gray-500 italic mt-1">{agence}</p>
          )} */}

          {email && (
            <p className="text-sm text-gray-600 mt-1">
              ✉️ <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </p>
          )}
          {/* <p className="text-sm text-gray-700 mt-1">📞 {tel}</p> */}
          {/* <p className='text-sm text-gray-600 mt-1'> 
            <a href={`mailto:${email}`} className='hover:underline'> envoyez un mail {email}</a>
          </p> */}
        </div>
      </div>

      {/* Bouton RDV */}
      {onPrendre && (
        <div className="flex justify-end">
          <button
            onClick={onPrendre}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm shadow-sm transition duration-200"
          >
            {t('ownerCard.RDV')}
          </button>
        </div>
      )}
    </div>
  )
}

export default OwnerCard

