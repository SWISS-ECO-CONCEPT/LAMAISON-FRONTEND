import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const Header = ({
  // sidebarOpen,
  // setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);

  // Exemple : rôle stocké dans localStorage après login
  // const role = localStorage.getItem("role") || "PROSPECT";
  const { lng } = useParams<{ lng: string }>();
  const role = location.pathname.includes("prospect") ? "PROSPECT" : "AGENT";
  const { signOut } = useAuth();

  // Menu dynamique selon le rôle
  const menuItems =
    role === "AGENT"
      ? [
        { path: "/dashboard/agent/profile", label: "Mon profil" },
      ]
      : [
        { path: "/dashboard/prospect/profile", label: "Mon profil" },
      ];

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-end items-center">


      {/* Menu Mon Compte */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:shadow-md transition"
        >
          {/* Avatar mock (tu pourras remplacer par un avatar dynamique) */}
          <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
            {role[0]} {/* Affiche la première lettre du rôle */}
          </div>
          <span className="hidden sm:inline font-medium">Mon Compte</span>
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
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
