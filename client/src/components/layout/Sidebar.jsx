import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome, FiBriefcase, FiFileText, FiCalendar, FiFolder,
  FiMessageSquare, FiBell, FiUser, FiSettings, FiLogOut,
  FiUsers, FiPieChart, FiCheckSquare, FiBookOpen
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Sidebar.css";

const menus = {
  étudiant: [
    { to: "/dashboard/student",            icon: <FiHome/>,          label: "Tableau de bord" },
    { to: "/dashboard/student/offers",     icon: <FiBriefcase/>,     label: "Offres de stage" },
    { to: "/dashboard/student/applications", icon: <FiFileText/>,    label: "Mes candidatures" },
    { to: "/dashboard/student/interviews", icon: <FiCalendar/>,      label: "Entretiens" },
    { to: "/dashboard/student/documents",  icon: <FiFolder/>,        label: "Mes documents" },
    { to: "/dashboard/student/messages",   icon: <FiMessageSquare/>, label: "Messagerie" },
    { to: "/dashboard/student/notifications", icon: <FiBell/>,        label: "Notifications" },
    { to: "/dashboard/student/profile",    icon: <FiUser/>,          label: "Mon profil" },
  ],
  entreprise: [
    { to: "/dashboard/company",              icon: <FiHome/>,          label: "Tableau de bord" },
    { to: "/dashboard/company/offers",       icon: <FiBriefcase/>,     label: "Offres de stage" },
    { to: "/dashboard/company/candidates",   icon: <FiUsers/>,         label: "Candidatures" },
    { to: "/dashboard/company/interviews",   icon: <FiCalendar/>,      label: "Entretiens" },
    { to: "/dashboard/company/messages",     icon: <FiMessageSquare/>, label: "Messagerie" },
    { to: "/dashboard/company/stats",        icon: <FiPieChart/>,      label: "Statistiques" },
    { to: "/dashboard/company/profile",      icon: <FiUser/>,          label: "Mon profil" },
  ],
  encadrant: [
    { to: "/dashboard/supervisor",            icon: <FiHome/>,          label: "Tableau de bord" },
    { to: "/dashboard/supervisor/students",   icon: <FiBookOpen/>,      label: "Mes étudiants" },
    { to: "/dashboard/supervisor/follow-up",  icon: <FiCheckSquare/>,   label: "Suivi des stages" },
    { to: "/dashboard/supervisor/documents",  icon: <FiFolder/>,        label: "Documents à valider" },
    { to: "/dashboard/supervisor/evaluations",icon: <FiFileText/>,      label: "Évaluations" },
    { to: "/dashboard/supervisor/messages",   icon: <FiMessageSquare/>, label: "Messagerie" },
    { to: "/dashboard/supervisor/profile",    icon: <FiUser/>,          label: "Mon profil" },
  ],
  admin: [
    { to: "/dashboard/admin",            icon: <FiHome/>,      label: "Tableau de bord" },
    { to: "/dashboard/admin/users",      icon: <FiUsers/>,     label: "Utilisateurs" },
    { to: "/dashboard/admin/companies",  icon: <FiBriefcase/>, label: "Entreprises" },
    { to: "/dashboard/admin/offers",     icon: <FiFileText/>,  label: "Offres de stage" },
    { to: "/dashboard/admin/applications", icon: <FiCheckSquare/>, label: "Candidatures" },
    { to: "/dashboard/admin/stats",      icon: <FiPieChart/>,  label: "Statistiques" },
    { to: "/dashboard/admin/settings",   icon: <FiSettings/>,  label: "Paramètres" },
  ],
};

const roleColors = {
  étudiant:   "#2563EB",
  entreprise: "#10B981",
  encadrant:  "#F59E0B",
  admin:      "#8B5CF6",
};

const roleLabels = {
  étudiant:   "Étudiant",
  entreprise: "Entreprise",
  encadrant:  "Encadrant",
  admin:      "Administrateur",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const color = roleColors[user?.role] || "#2563EB";
  const items = menus[user?.role] || menus.étudiant;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon" style={{ background: color }}>S</span>
        <span>StageFlow</span>
      </div>

      <div className="sidebar-role-badge" style={{ background: color + "15", color }}>
        {roleLabels[user?.role]}
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to.split("/").length <= 3}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            style={({ isActive }) => isActive ? { background: color + "12", color } : {}}>
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut/> Déconnexion
      </button>
    </aside>
  );
}
