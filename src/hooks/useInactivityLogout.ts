import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 5* 60 * 1000; // 5 minutes en millisecondes

export const useInactivityLogout = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();

  useEffect(() => {
    if (!isSignedIn) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        console.log('Inactivité détectée - déconnexion...');
        // Déconnexion après l'expiration du délai d'inactivité
        signOut().then(() => {
          navigate(`/${lng}/login`);
        }).catch(err => {
          console.error('Erreur lors de la déconnexion:', err);
          navigate(`/${lng}/login`);
        });
      }, INACTIVITY_TIMEOUT);
    };

    // Réinitialiser le timer lors d'événements utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Démarrer le timer initial
    resetTimer();

    // Nettoyage
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isSignedIn, signOut, navigate, lng]);
};
