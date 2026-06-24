import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import "./DashboardLayout.css";

export default function DashboardLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("sb_main") !== "false" && localStorage.getItem("sb_main") !== JSON.stringify(false)
  );

  return (
    <div className={`dl-shell ${sidebarOpen ? "dl-shell--open" : "dl-shell--closed"}`}>
      {/* Sidebar fixe gauche */}
      <Sidebar onToggle={setSidebarOpen} />

      {/* Colonne centrale : topbar fixe + contenu scrollable */}
      <div className="dl-main">
        <Topbar title={title} subtitle={subtitle} />
        <div className="dl-content">
          {children}
        </div>
      </div>
    </div>
  );
}