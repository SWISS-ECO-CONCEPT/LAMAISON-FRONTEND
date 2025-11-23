// src/App.tsx
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import './App.css';
import Layout from './layouts/Layout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages publiques
import Annonces from './pages/Annonce/Annonces';
import Home from './pages/Home/Home';
import AnnonceDetail from './pages/Annonce/AnnonceDetail';
import Inscription from './pages/Auth/Inscription';
import Connexion from './pages/Auth/Connexion';
import APropos from './pages/About/APropos';
import Contact from './pages/Contact/Contact';
import CGU from './pages/CGU/CGU';
import MentionsLegales from './pages/LegalMetion/MentionsLegales';
import Confidentialite from './pages/Confidentiality/Confidentiality';

// i18n
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Dashboards
import DashboardAgent from './pages/Dashboard/Home/DashboardAgent';
import DashboardProspect from './pages/Dashboard/Home/DashboardProspect';
// import DashboardProfile from './pages/Dashboard/Profile/DashboardProfile';
import AnnonceForm from '../src/components/DashboardComponents/AnnonceForm';
import AnnonceList from '../src/components/DashboardComponents/AnnonceList';
import Profile from './pages/Dashboard/Profile/Profile';
import MessagesLayout from './layouts/MessagesLayout';
import RdvProspect from './components/DashboardComponents/AppointmentComponents/RdvProspect';
import RdvAgent from './components/DashboardComponents/AppointmentComponents/RdvAgent';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Settings from './pages/Dashboard/Settings/settings';
import VerificationCode from './pages/Auth/VerificationCode';
import FavorisList from './components/DashboardComponents/FavorisList';
// import DashboardProfile from '../src/components/DashboardComponents/DashboardProfile';

function LocaleWrapper() {
  const { i18n } = useTranslation(); // Accès à l’instance i18next
  const { lng } = useParams<{ lng: string }>(); // Langue récupérée depuis l’URL
  const location = useLocation(); // Pour rediriger ou récupérer le chemin actuel
  const [ready, setReady] = useState(false); // Permet de bloquer le rendu tant que la langue n’est pas chargée


  useEffect(() => {
    // Si la langue est invalide, on ne fait rien
    if (!lng || !['fr', 'en'].includes(lng)) return;
    const handleInit = () => setReady(true);

    // Si i18next est déjà prêt avec la bonne langue → rien à faire
    if (i18n.isInitialized && i18n.language === lng) {
      setReady(true);
    } else {
      // Sinon → on change de langue puis on attend qu’elle soit prête
      i18n.changeLanguage(lng).then(() => handleInit());
    }

    // Nettoyage éventuel (sécurité)
    return () => {
      i18n.off('initialized', handleInit);
    };
  }, [lng, i18n]);

  // Si la langue n’est pas présente ou incorrecte → redirection propre vers "/en"
  if (!lng || !['fr', 'en'].includes(lng)) {
    return <Navigate to={`/en${location.pathname}`} replace />;
  }

  // Si la langue n’est pas encore chargée → on affiche un petit loader
  if (!ready) {
    return <div>Chargement des traductions…</div>;
  }

  return (
    <>
      {/*Routes publiques avec Layout global */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/posts" element={<Annonces />} />
          <Route path="/post/:id" element={<AnnonceDetail />} />
          <Route path="/about" element={<APropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Connexion />} />
          <Route path="/signup" element={<Inscription />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/legal-notice" element={<MentionsLegales />} />
          <Route path="/confidentiality" element={<Confidentialite />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/:lng/verify-email" element={<VerificationCode />} />
        </Route>
      </Routes>


      {/*Routes privées Dashboard */}
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Agent */}
          <Route path="agent">
            <Route index element={<DashboardAgent />} />
            <Route path="home" element={<DashboardAgent />} />
            <Route path="annonces" element={<AnnonceList />} />
            <Route path="annonces/new" element={<AnnonceForm />} />
            <Route path="profile" element={<Profile />} />
            <Route path="messages" element={<MessagesLayout />} />
            <Route path="messages/:id" element={<MessagesLayout />} />
            <Route path="rdv" element={<RdvAgent />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Prospect */}
          <Route path="prospect">
            <Route index element={<DashboardProspect />} />
            <Route path="home" element={<DashboardProspect />} />
            <Route path="favoris" element={<FavorisList />} />
            <Route path="annonces" element={<AnnonceList />} />
            <Route path="profile" element={<Profile />} />
            <Route path="messages" element={<MessagesLayout />} />
            <Route path="messages/:id" element={<MessagesLayout />} />
            <Route path="rdv" element={<RdvProspect />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Redirection initiale vers la langue par défaut */}
      <Route path="/" element={<Navigate to="/fr/" replace />} />

      {/* Toutes les routes sont regroupées sous le préfixe langue */}
      <Route path=":lng/*" element={<LocaleWrapper />} />
    </Routes>
  );
}

export default App;


