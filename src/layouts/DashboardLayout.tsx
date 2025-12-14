import { Navigate, Outlet, useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar";
import Header from "../components/DashboardComponents/Header";
// import NotificationAlarm from "../components/DashboardComponents/AppointmentComponents/NotificationAlarm";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
// import { useNotifications } from "../hooks/useNotifications";
import { useNotificationsContext } from "../context/NotificationsContext";
import { useSimpleSocket } from "../services/socket.service";


const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // const { notifications, dismissNotification, clearAllNotifications } = useNotifications();

  const { lng } = useParams<{ lng: string }>();
  const location = useLocation();

  const { user, isLoaded } = useUser();
  const { addNotification } = useNotificationsContext();
  const socket = useSimpleSocket();

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handler = (payload: any) => {
      const isForAgent = payload?.agentClerkId && payload.agentClerkId === user.id;
      const isForProspect = payload?.prospectClerkId && payload.prospectClerkId === user.id;
      if (!isForAgent && !isForProspect) return;

      if (payload?.type === 'rdv_request' && isForAgent) {
        addNotification('rdv-request', 'Nouvelle demande de RDV', `RDV #${payload.rdvId} en attente`, payload.rdvId);
        return;
      }

      if (payload?.type === 'rdv_proposed' && isForProspect) {
        addNotification('rdv-response', 'Nouvelle proposition de RDV', `RDV #${payload.rdvId} à valider`, payload.rdvId);
        return;
      }

      if ((payload?.type === 'rdv_accepted' || payload?.type === 'proposal_accepted') && isForProspect) {
        addNotification('rdv-response', 'RDV accepté', `RDV #${payload.rdvId} accepté`, payload.rdvId);
        return;
      }

      if ((payload?.type === 'rdv_rejected') && isForProspect) {
        addNotification('rdv-response', 'RDV refusé', `RDV #${payload.rdvId} refusé`, payload.rdvId);
        return;
      }

      if ((payload?.type === 'proposal_rejected') && isForAgent) {
        addNotification('rdv-response', 'Proposition refusée', `Le prospect a refusé la proposition pour RDV #${payload.rdvId}`, payload.rdvId);
        return;
      }

      addNotification('rdv-response', 'RDV mis à jour', `RDV #${payload.rdvId} mis à jour`, payload.rdvId);
    };

    socket.on('rdv_update', handler);
    return () => {
      socket.off('rdv_update', handler);
    };
  }, [socket, user?.id, addNotification]);
  
  useEffect(() => {
    // Vérifier que l'utilisateur est sur le bon dashboard selon son rôle
    if (!isLoaded || !user) return;

    const userRole = (user?.unsafeMetadata?.role as string) || "PROSPECT";
    const currentPath = location.pathname;
    
    // Si l'utilisateur est AGENT mais sur la route prospect, rediriger
    if (userRole === "AGENT" && currentPath.includes("/dashboard/prospect")) {
      window.location.href = `/${lng}/dashboard/agent`;
      return;
    }
    
    // Si l'utilisateur est PROSPECT mais sur la route agent, rediriger
    if (userRole === "PROSPECT" && currentPath.includes("/dashboard/agent")) {
      window.location.href = `/${lng}/dashboard/prospect`;
      return;
    }
  }, [user, location.pathname, lng, isLoaded]);

  if (!isLoaded) return <div>Chargement...</div>;
  if (!user) return <Navigate to={`/${lng}/login`} />;
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        <Header />             

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Ici s'affichent les pages (dashboard, annonces, etc.) */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
