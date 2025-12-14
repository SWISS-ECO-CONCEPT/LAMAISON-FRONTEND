import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RdvCard from "../AppointmentComponents/RdvCard";
import { useUser, useAuth } from "@clerk/clerk-react";
import { getOrCreateConversation } from "../../../services/messagingService";
import { useLocation, useNavigate } from "react-router-dom";

type RdvData = {
  id: number;
  date: string;
  heure: string;
  bien: string;
  prospect: string;
  status: "pending" | "confirmed" | "rejected" | "proposed";
  proposedDate?: string;
  proposedHeure?: string;
  message?: string;
  prospectId?: number;
  prospectClerkId?: string;
  prospectEmail?: string;
};

type RemoteRdvData = {
  id: number;
  date: string;
  proposedDate?: string | null;
  nom?: string;
  prenom?: string;
  status: string;
  message?: string;
  prospectId?: number;
  prospect?: { clerkId?: string } | null;
  annonce?: { titre?: string; proprietaire?: { clerkId?: string } | null } | null;
};

const RdvAgent: React.FC = () => {
  const { t } = useTranslation();
  const [rdvs, setRdvs] = useState<RdvData[]>([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingId, setLoadingId] = useState<number | null>(null);

      useEffect(() => {
    const fetchRdvs = async () => {
      if (!user?.id) return;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${API_URL}/rdvs?agentClerkId=${user.id}`);
        const data: RemoteRdvData[] = await res.json();
        const mapped: RdvData[] = data.map((r: RemoteRdvData) => ({
          id: r.id,
          date: new Date(r.date).toLocaleDateString(),
          heure: new Date(r.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          proposedDate: r.proposedDate ? new Date(r.proposedDate).toLocaleDateString() : undefined,
          proposedHeure: r.proposedDate ? new Date(r.proposedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined,
          bien: r.annonce?.titre || '—',
          prospect: `${r.nom || r.prenom || ''}`.trim(),
          status: r.status === 'ACCEPTE' ? 'confirmed' : (r.status === 'REFUSE' || r.status === 'ANNULE' ? 'rejected' : (r.status === 'PROPOSE' ? 'proposed' : 'pending')),
          message: r.message,
          prospectId: r.prospectId,
          prospectClerkId: r.prospect?.clerkId,
        }))
        setRdvs(mapped)
        
      } catch (err) {
        console.error('Erreur fetch rdvs agent', err)
      }
    }
    fetchRdvs()
  }, [user?.id, t])

  const handleAction = async (index: number, action: "confirm" | "reject") => {
    const rdv = rdvs[index];
    if (!rdv) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newStatus = action === 'confirm' ? 'ACCEPTE' : 'REFUSE';
    try {
      setLoadingId(rdv.id);
      const token = await getToken();
      if (!token) {
        console.error('Non authentifié');
        setLoadingId(null);
        return;
      }
      const res = await fetch(`${API_URL}/rdvs/${rdv.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      await res.json();
      // refresh list
      setRdvs((prev) => prev.map((r, i) => i === index ? { ...r, status: newStatus === 'ACCEPTE' ? 'confirmed' : 'rejected' } : r));
    } catch (err) {
      console.error('Erreur update rdv', err)
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenChat = async (index: number) => {
    const rdv = rdvs[index];
    if (!rdv || !user?.id) return;
    if (!rdv.prospectClerkId) return;

    try {
      const token = await getToken();
      const conv = await getOrCreateConversation(rdv.prospectClerkId, user.id, rdv.id, token || undefined);
      const otherUserId = conv.senderId; // prospect

      // keep current dashboard prefix (/dashboard/agent or /dashboard/prospect)
      const base = location.pathname.includes('/dashboard/agent') ? '/dashboard/agent/messages' : '/dashboard/prospect/messages';
      navigate(`${base}?otherUserId=${otherUserId}`);
    } catch (e) {
      console.error('Erreur ouverture chat:', e);
    }
  };

  const handlePropose = async (index: number) => {
    const rdv = rdvs[index];
    if (!rdv) return;

    const proposed = window.prompt('Nouvelle date/heure (ex: 2025-12-31T14:30)');
    if (!proposed) return;
    const proposedDate = new Date(proposed);
    if (Number.isNaN(proposedDate.getTime())) {
      console.error('Date invalide');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      setLoadingId(rdv.id);
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/rdvs/${rdv.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'PROPOSE', proposedDate: proposedDate.toISOString() })
      });
      if (!res.ok) {
        throw new Error('Erreur lors de la proposition');
      }
      const updated = await res.json();
      setRdvs((prev) => prev.map((r, i) => i === index ? {
        ...r,
        status: 'proposed',
        proposedDate: new Date(updated.proposedDate || proposedDate).toLocaleDateString(),
        proposedHeure: new Date(updated.proposedDate || proposedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      } : r));
    } catch (e) {
      console.error('Erreur propose rdv', e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{t('rdvAgent.title')}</h2>
      {rdvs.length === 0 ? (
        <p className="text-gray-500">{t('rdvAgent.noAppointments')}</p>
      ) : (
        rdvs.map((rdv, i) => (
          <div key={rdv.id} className="space-y-2">
            <RdvCard
              {...rdv}
              PROSPECT={rdv.prospect}
              message={rdv.message}
              isLoading={loadingId === rdv.id}
              onAction={(action) => handleAction(i, action)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handlePropose(i)}
                disabled={loadingId === rdv.id}
                className={`px-3 py-1 bg-blue-600 text-white rounded-lg text-sm transition ${loadingId === rdv.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                Proposer
              </button>
              <button
                onClick={() => handleOpenChat(i)}
                className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm transition hover:bg-gray-900"
              >
                Messagerie
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RdvAgent;
