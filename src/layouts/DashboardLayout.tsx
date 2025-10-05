import { Navigate, Outlet, useParams } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar";
import Header from "../components/DashboardComponents/Header";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";


const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { lng } = useParams<{ lng: string }>();

  const { user }: any = useUser();
  if (!user) return <Navigate to={`/${lng}/login`} />
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Ici s'affichent les pages (dashboard, annonces, etc.) */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
