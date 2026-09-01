import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import RdvCard from "../AppointmentComponents/RdvCard";
import { Calendar } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { format } from 'date-fns'
import { getOrCreateConversation } from "../../../services/messagingService";
import { useNavigate, useParams } from "react-router-dom";

type RdvCardData = {
  id: number;
  date: string;
  heure: string;
  proposedDate?: string;
  proposedHeure?: string;
  bien: string;
  agent: string;
  agentClerkId?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'proposed';
};

type RemoteRdv = {
  id: number;
  date: string;
  proposedDate?: string | null;
  nom?: string;
  prenom?: string;
  status: string;
  annonce: {
    titre?: string;
    proprietaire?: { firstname?: string; clerkId?: string };
  } | null;
}

const RdvProspect: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();
  const [rdvs, setRdvs] = useState<RdvCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const fetchRdvs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/rdvs?prospectClerkId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data: RemoteRdv[] = await res.json();
      const mapped: RdvCardData[] = data.map(r => ({
        id: r.id,
        date: format(new Date(r.date), 'dd/MM/yyyy'),
        heure: format(new Date(r.date), 'HH:mm'),
        proposedDate: r.proposedDate ? format(new Date(r.proposedDate), 'dd/MM/yyyy') : undefined,
        proposedHeure: r.proposedDate ? format(new Date(r.proposedDate), 'HH:mm') : undefined,
        bien: r.annonce?.titre || '—',
        agent: r.annonce?.proprietaire?.firstname || '',
        agentClerkId: r.annonce?.proprietaire?.clerkId,
        status: r.status === 'ACCEPTE'
          ? 'confirmed' : (r.status === 'REFUSE' || r.status === 'ANNULE'
            ? 'rejected' : (r.status === 'PROPOSE' ? 'proposed' : 'pending'))
      }))

      setRdvs(mapped)
    } catch (err) {
      console.error('Erreur fetch rdvs prospect', err)
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleProposalAction = async (index: number, action: 'accept' | 'reject') => {
    const rdv = rdvs[index];
    if (!rdv) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      setLoadingId(rdv.id);
      const token = await getToken();
      if (!token) return;

      const nextStatus = action === 'accept' ? 'ACCEPTE' : 'EN_ATTENTE';
      const res = await fetch(`${API_URL}/rdvs/${rdv.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await res.json();
      setRdvs((prev) => prev.map((r, i) => i === index
        ? {
          ...r,
          status: action === 'accept' ? 'confirmed' : 'pending',
          proposedDate: action === 'accept' ? undefined : r.proposedDate,
          proposedHeure: action === 'accept' ? undefined : r.proposedHeure,
        }
        : r));
    } catch (e) {
      console.error('Erreur proposition rdv', e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenChat = async (index: number) => {
    const rdv = rdvs[index];
    if (!rdv || !user?.id) return;
    if (!rdv.agentClerkId) return;

    try {
      const token = await getToken();
      const conv = await getOrCreateConversation(user.id, rdv.agentClerkId, rdv.id, token || undefined);
      const otherUserId = conv.receiverId; // agent
      console.log("other", conv.receiverId)
      const langPrefix = lng || 'fr';
      const base = `/${langPrefix}/dashboard/prospect/messages`;
      navigate(`${base}?otherUserId=${otherUserId}`);
    } catch (e) {
      console.error('Erreur ouverture chat:', e);
    }
  };

  useEffect(() => {
    fetchRdvs();
  }, [fetchRdvs]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Calendar className="text-gray-600 w-6 h-6" />
        {t('rdvProspect.title')}
      </h2>

      {loading ? (
        <p className="text-gray-500">{t('common.loading')}...</p>
      ) : rdvs.length > 0 ? (
        rdvs.map((rdv, i) => (
          <div key={rdv.id} className="space-y-2">
            <RdvCard
              {...rdv}
              AGENT={rdv.agent}
              isLoading={loadingId === rdv.id}
            />

            {rdv.status === 'proposed' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleProposalAction(i, 'accept')}
                  disabled={loadingId === rdv.id}
                  className={`px-3 py-1 bg-green-600 text-white rounded-lg text-sm transition ${loadingId === rdv.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                >
                  {t('rdvProspect.actions.accept')}
                </button>
                <button
                  onClick={() => handleProposalAction(i, 'reject')}
                  disabled={loadingId === rdv.id}
                  className={`px-3 py-1 bg-red-600 text-white rounded-lg text-sm transition ${loadingId === rdv.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                >
                  {t('rdvProspect.actions.reject')}
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleOpenChat(i)}
                className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm transition hover:bg-gray-900"
              >
                {t('rdvProspect.actions.messaging')}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">{t('rdvAgent.noAppointments')}</p>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p>💡 {t('rdvProspect.title')} : </p>
        <p className="mt-2">{t('rdvProspect.note')}</p>
      </div>
    </div>
  );
};

export default RdvProspect;
