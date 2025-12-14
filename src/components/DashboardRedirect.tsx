import { Navigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Composant qui redirige automatiquement vers le bon dashboard basé sur le rôle
 * Si l'utilisateur accède à /dashboard/prospect mais son rôle est AGENT, il sera redirigé vers /dashboard/agent
 */
const DashboardRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { user: contextUser } = useContext(AuthContext);
  const { lng } = useParams<{ lng: string }>();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Attendre que Clerk soit chargé
    if (!isLoaded || !clerkUser) return;

    // Déterminer le rôle actuel
    const currentRole = (clerkUser?.unsafeMetadata?.role as string) || contextUser?.role || "PROSPECT";
    const currentPath = window.location.pathname;

    // Vérifier si l'utilisateur est sur le mauvais dashboard
    if (currentRole === "AGENT" && currentPath.includes("/dashboard/prospect")) {
      setShouldRedirect(true);
    } else if (currentRole === "PROSPECT" && currentPath.includes("/dashboard/agent")) {
      setShouldRedirect(true);
    }
  }, [clerkUser, contextUser, isLoaded]);

  if (shouldRedirect) {
    const role = (clerkUser?.unsafeMetadata?.role as string) || contextUser?.role || "PROSPECT";
    const dashboardPath = role === "AGENT" 
      ? `/${lng}/dashboard/agent` 
      : `/${lng}/dashboard/prospect`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default DashboardRedirect;
