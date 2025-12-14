import { Building, Calendar,MessageCircle } from "lucide-react";
import React from "react";
import { FaUser } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

interface RdvCardProps {
  date: string;
  heure: string;
  bien: string;
  PROSPECT?: string;
  AGENT?: string;
  status: "pending" | "confirmed" | "rejected" | "proposed";
  proposedDate?: string;
  proposedHeure?: string;
  message?: string; // Message du prospect pour l'agent
  onAction?: (action: "confirm" | "reject") => void; // utilisé côté agent
  isLoading?: boolean; // show loading state for buttons
}

const RdvCard: React.FC<RdvCardProps> = ({ date, heure, bien, PROSPECT, AGENT, status, proposedDate, proposedHeure, message, onAction, isLoading }) => {
  const { t } = useTranslation();
  
  // Determine which buttons should be disabled based on status
  const isConfirmed = status === "confirmed";
  const isRejected = status === "rejected";
  const isProposed = status === "proposed";

  const statusLabel =
    status === "confirmed"
      ? t('rdvCard.status.confirmed')
      : status === "rejected"
        ? t('rdvCard.status.rejected')
        : status === "proposed"
          ? (t('rdvCard.status.proposed') === 'rdvCard.status.proposed' ? 'Proposé' : t('rdvCard.status.proposed'))
          : t('rdvCard.status.pending');
  
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h3 className="font-semibold text-lg">{bien}</h3>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Calendar className="text-gray-600 w-4 h-4" />{date} {t('rdvCard.actions.atTime')} {heure}
        </p>

        {isProposed && proposedDate && proposedHeure && (
          <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
            <Calendar className="text-blue-700 w-4 h-4" />Proposition : {proposedDate} {t('rdvCard.actions.atTime')} {proposedHeure}
          </p>
        )}
        {PROSPECT && (
          <p className="text-sm flex items-center gap-1">
            <FaUser className="text-gray-600 w-4 h-4" />
            {t('rdvCard.prospect')} : {PROSPECT}
          </p>
        )}
        {AGENT && (
          <p className="text-sm flex items-center gap-1">
            <Building className="text-indigo-600 w-4 h-4" />
            {t('rdvCard.agent')} : {AGENT}
          </p>
        )}

        {/* Message du prospect (visible pour l'agent) */}
        {message && (
          <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="flex items-center gap-1 font-semibold text-blue-800 text-sm"><MessageCircle className="text-blue-800 w-4 h-4 "/> Message du prospect:</p>
            <p className="text-xs text-blue-700 mt-1 italic">{message}</p>
          </div>
        )}

        {/* Badge de statut */}
        <span className={`px-3 py-1 text-xs rounded-full mt-1 inline-block
          ${status === "confirmed" ? "bg-green-100 text-green-600" : ""}
          ${status === "rejected" ? "bg-red-100 text-red-600" : ""}
          ${status === "pending" ? "bg-yellow-100 text-yellow-600" : ""}
          ${status === "proposed" ? "bg-blue-100 text-blue-700" : ""}
        `}>
          {statusLabel}
        </span>
      </div>
      {/* Boutons d'action visibles uniquement côté Agent */}
      {onAction && (
        <div className={`flex gap-2 ${isLoading ? 'cursor-not-allowed' : ''}`}>
          <button
            onClick={() => onAction("confirm")}
            disabled={isLoading || isConfirmed}
            className={`px-3 py-1 bg-green-500 text-white rounded-lg text-sm transition ${
              isLoading || isConfirmed
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-green-600'
            }`}
          >
            {t('rdvCard.actions.confirm')}
          </button>
          <button
            onClick={() => onAction("reject")}
            disabled={isLoading || isRejected}
            className={`px-3 py-1 bg-red-500 text-white rounded-lg text-sm transition ${
              isLoading || isRejected
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-red-600'
            }`}
          >
            {t('rdvCard.actions.reject')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RdvCard;
