// src/pages/Dashboard/Settings/Settings.tsx
import { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import { AuthContext } from "../../../context/AuthContext";
import { updateUserRole } from "../../../services/authService";
import { useNavigate } from "react-router-dom";


const Settings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user: clerkUser, isLoaded } = useUser();
  const { user: contextUser, updateUser } = useContext(AuthContext);

  // Déterminer le rôle actuel: en priorité Clerk, sinon le contexte
  const currentRole = (clerkUser?.unsafeMetadata?.role as string) || contextUser?.role || "PROSPECT";

  // États locaux
  const [language, setLanguage] = useState(i18n.language || "fr");
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleMessage, setRoleMessage] = useState("");
  const [roleMessageType, setRoleMessageType] = useState<"success" | "error" | "">();

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  // Mot de passe
  const [password, setPassword] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // Synchroniser selectedRole quand le rôle change (Clerk ou contexte)
  useEffect(() => {
    const newRole = (clerkUser?.unsafeMetadata?.role as string) || contextUser?.role || "PROSPECT";
    setSelectedRole(newRole);
  }, [clerkUser?.unsafeMetadata?.role, contextUser?.role, isLoaded]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) {
      alert(t('settings.password.mismatch'));
      return;
    }
    console.log("Password changed successfully ✅");
    alert(t('settings.password.success'));
    setPassword({ current: "", newPass: "", confirm: "" });
  };

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clerkUser?.id) {
      setRoleMessage("Erreur: utilisateur non authentifié");
      setRoleMessageType("error");
      return;
    }

    if (!selectedRole) {
      setRoleMessage("Veuillez sélectionner un rôle");
      setRoleMessageType("error");
      return;
    }

    if (selectedRole === currentRole) {
      setRoleMessage("Veuillez sélectionner un rôle différent");
      setRoleMessageType("error");
      return;
    }

    setIsUpdatingRole(true);
    setRoleMessage("");

    try {
      const response = await updateUserRole(clerkUser.id, selectedRole);

      // Mettre à jour le contexte utilisateur IMMÉDIATEMENT
      const updatedUser = {
        ...contextUser,
        role: response.user.role,
      };
      updateUser(updatedUser);

      // Mettre à jour selectedRole pour que le formulaire se réinitialise
      setSelectedRole(response.user.role);

      setRoleMessage(t('settings.role.success') || "Rôle mis à jour avec succès");
      setRoleMessageType("success");

      // Rediriger vers le nouveau dashboard après 1.5 secondes
      setTimeout(() => {
        // Effacer le cache Clerk et forcer la redirection
        const dashboardPath = response.user.role === "AGENT"
          // ? window.location.pathname.replace("/prospect", "/agent").replace("/prospect/", "/agent/")
          // : window.location.pathname.replace("/agent", "/prospect").replace("/agent/", "/prospect/");
          ? "/dashboard/agent"
          : "/dashboard/prospect";

        // Utiliser window.location.href pour forcer un vrai rechargement
        // window.location.href = dashboardPath;
        navigate(dashboardPath, { replace: true });
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour du rôle";
      setRoleMessage(errorMessage);
      setRoleMessageType("error");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>

      {/* Rôle */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{t('settings.sections.role') || 'Rôle'}</h2>
        <form onSubmit={handleRoleChange} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              {t('settings.role.current') || 'Rôle actuel'}: <span className="font-semibold">{currentRole}</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="PROSPECT">{t('settings.role.prospect') || 'Prospect'}</option>
              <option value="AGENT">{t('settings.role.agent') || 'Agent'}</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              {t('settings.role.description') || 'Changer votre rôle vous permettra d\'accéder à différentes fonctionnalités.'}
            </p>
          </div>

          {roleMessage && (
            <div
              className={`p-3 rounded-md text-white ${roleMessageType === "success" ? "bg-green-500" : "bg-red-500"
                }`}
            >
              {roleMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingRole || selectedRole === currentRole}
            className={`px-6 py-2 rounded-md text-white font-medium ${isUpdatingRole || selectedRole === currentRole
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isUpdatingRole ? (t('settings.role.updating') || 'Mise à jour...') : (t('settings.role.updateButton') || 'Mettre à jour le rôle')}
          </button>
        </form>
      </section>

      {/* Mot de passe */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{t('settings.sections.security')}</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">{t('settings.password.current')}</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) =>
                setPassword({ ...password, current: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">{t('settings.password.new')}</label>
            <input
              type="password"
              value={password.newPass}
              onChange={(e) =>
                setPassword({ ...password, newPass: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">{t('settings.password.confirm')}</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) =>
                setPassword({ ...password, confirm: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            {t('settings.password.updateButton')}
          </button>
        </form>
      </section>

      {/* Langue */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{t('settings.sections.language')}</h2>
        <select
          value={language}
          onChange={(e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            i18n.changeLanguage(newLang);
          }}
          className="border px-3 py-2 rounded-md"
        >
          <option value="fr">{t('settings.languageOptions.fr')}</option>
          <option value="en">{t('settings.languageOptions.en')}</option>
        </select>
      </section>

      {/* Notifications */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{t('settings.sections.notifications')}</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() =>
                setNotifications({ ...notifications, email: !notifications.email })
              }
              className="w-5 h-5"
            />
            {t('settings.notifications.email')}
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={() =>
                setNotifications({ ...notifications, push: !notifications.push })
              }
              className="w-5 h-5"
            />
            {t('settings.notifications.push')}
          </label>
        </div>
      </section>
    </div>
  );
};

export default Settings;


