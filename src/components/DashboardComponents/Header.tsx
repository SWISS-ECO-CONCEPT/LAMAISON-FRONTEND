import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import NotificationAlarm from "./AppointmentComponents/NotificationAlarm";
import { useNotificationsContext } from "../../context/NotificationsContext";


const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  // Exemple : rôle stocké dans localStorage après login
  // const role = localStorage.getItem("role") || "PROSPECT";
  const { lng } = useParams<{ lng: string }>();
  // const role = location.pathname.includes("prospect") ? "PROSPECT" : "AGENT";
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const role = (clerkUser?.unsafeMetadata?.role as string);
  const { t } = useTranslation();
  const { notifications, dismissNotification, clearAllNotifications } = useNotificationsContext();


  // Menu dynamique selon le rôle
  const menuItems = [
    {
      path: `/${lng}/home`,
      label: t('header.backToSite') || 'Retour au site',
      className: "text-sm font-medium text-gray-700 whitespace-nowrap"
    },
  ];

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-end items-center gap-2">
      <div className="">
        <NotificationAlarm
          notifications={notifications}
          onDismiss={dismissNotification}
          onClear={clearAllNotifications}
        />
      </div>
      {/* Menu Mon Compte */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:shadow-md transition"
        >
          {/* Avatar mock (tu pourras remplacer par un avatar dynamique) */}
          <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
            {role[0]}  {/*Affiche la première lettre du rôle */}
          </div>
          <span className="hidden sm:inline font-medium">{t('header.myAccount')}</span>
          <ChevronDown size={18} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg overflow-hidden border z-50">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-3 hover:bg-gray-100 text-gray-700"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Déconnexion */}
            <button
              onClick={async () => {
                localStorage.clear();
                if (signOut) await signOut(); // Déconnexion Clerk
                window.location.href = `/${lng}/login`;
              }}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
              {t('header.logout')} <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;