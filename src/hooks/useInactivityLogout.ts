import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes en millisecondes

export const useInactivityLogout = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        // Déconnexion après l'expiration du délai d'inactivité
        signOut().then(() => {
          navigate('/auth/sign-in');
        });
      }, INACTIVITY_TIMEOUT);
    };

    // Réinitialiser le timer lors d'événements utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
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
  }, [isSignedIn, signOut, navigate]);
};
