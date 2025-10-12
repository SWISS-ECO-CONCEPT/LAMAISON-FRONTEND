import { Link } from "react-router-dom";
// import { useState } from "react";
import logo from "../../assets/logo.jpg";
import { Menu, Home, FilePlus, List, User, Heart, MessageCircleIcon, Calendar, Settings } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) => {
  // const [open, setOpen] = useState(false);
  const { user } = useUser();
  // Rôle simulé depuis localStorage ( à remplacer avec AuthContext plus tard)
  const role = (user?.unsafeMetadata?.role as "AGENT" | "PROSPECT") || "PROSPECT";

  const links =
    role === "AGENT"
      ? [
        { path: "/dashboard/agent", label: "Tableau de bord", icon: <Home size={18} /> },
        { path: "/dashboard/agent/annonces", label: "Mes annonces", icon: <List size={18} /> },
        { path: "/dashboard/agent/annonces/new", label: "Publier une annonce", icon: <FilePlus size={18} /> },
        { path: "/dashboard/agent/messages", label: "Messagerie", icon: <MessageCircleIcon size={18} /> },
        { path: "/dashboard/agent/rdv", label: "Rendez-vous", icon: <Calendar size={18} /> },
        { path: "/dashboard/agent/profile", label: "Profil", icon: <User size={18} /> },
        { path: "/dashboard/agent/settings", label: "Paramètres", icon: <Settings size={18} /> }
      ]
      : [
        { path: "/dashboard/prospect", label: "Tableau de bord", icon: <Home size={18} /> },
        { path: "/dashboard/prospect/favoris", label: "Mes favoris", icon: <Heart size={18} /> },
        { path: "/dashboard/prospect/messages", label: "Messagerie", icon: <MessageCircleIcon size={18} /> },
        { path: "/dashboard/prospect/rdv", label: "Rendez-vous", icon: <Calendar size={18} /> },
        { path: "/dashboard/prospect/profile", label: "Profil", icon: <User size={18} /> },
        { path: "/dashboard/prospect/settings", label: "Paramètres", icon: <Settings size={18} /> }
      ];

  return (
    <>
      {/* Bouton burger mobile */}
      <button
        className="lg:hidden p-3 fixed top-4 left-4 z-10  text-black "
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-opacity-30 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar responsive*/}
      <aside
        className={`bg-white text-black h-full transition-all duration-300 z-40
          ${open ? "w-64" : "w-16"}
          fixed top-0 left-0 transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static`}

      >


        {/* Logo*/}
        <div className="flex justify-between items-center px-4 py-4">
          <img src={logo} alt="logo" className={`h-10 transition-all duration-300 ${open ? "block" : "hidden"} transition-all`} />

          <button
            className="hidden lg:block text-black "
            onClick={() => setOpen(!open)}
          >
            {open ? <Menu size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-green-600 transition duration-200
               ${open ? "justify-start" : "justify - center"}`}
              onClick={() => setOpen(false)}
            >
              {link.icon}
              {open && <span className="whitespace-nowrap">{link.label}</span>}

            </Link>
          ))}
        </nav>
      </aside >
    </>
  );
};

export default Sidebar;
