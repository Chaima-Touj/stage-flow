import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiHome, FiBriefcase, FiFileText, FiCalendar, FiFolder,
  FiMessageSquare, FiBell, FiUser, FiSettings, FiLogOut,
  FiUsers, FiPieChart, FiCheckSquare, FiBookOpen
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Sidebar.css";

const roleColors = {
  étudiant:   "#2563EB",
  entreprise: "#10B981",
  encadrant:  "#F59E0B",
  admin:      "#8B5CF6",
};

export default function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const color = roleColors[user?.role] || "#2563EB";

  const menus = {
    étudiant: [
      { to: "/dashboard/student",              icon: <FiHome/>,          label: t("sidebar.student.dashboard") },
      { to: "/dashboard/student/offers",       icon: <FiBriefcase/>,     label: t("sidebar.student.offers") },
      // ✅ AJOUT du lien Formation
      { to: "/dashboard/student/training",     icon: <FiBookOpen/>,      label: t("sidebar.student.training", "Formation") },
      { to: "/dashboard/student/applications", icon: <FiFileText/>,      label: t("sidebar.student.applications") },
      { to: "/dashboard/student/interviews",   icon: <FiCalendar/>,      label: t("sidebar.student.interviews") },
      { to: "/dashboard/student/documents",    icon: <FiFolder/>,        label: t("sidebar.student.documents") },
      { to: "/dashboard/student/messages",     icon: <FiMessageSquare/>, label: t("sidebar.student.messages") },
      { to: "/dashboard/student/notifications",icon: <FiBell/>,          label: t("sidebar.student.notifications") },
      { to: "/dashboard/student/profile",      icon: <FiUser/>,          label: t("sidebar.student.profile") },
    ],
    entreprise: [
      { to: "/dashboard/company",            icon: <FiHome/>,          label: t("sidebar.student.dashboard") },
      { to: "/dashboard/company/offers",     icon: <FiBriefcase/>,     label: t("sidebar.student.offers") },
      { to: "/dashboard/company/candidates", icon: <FiUsers/>,         label: t("sidebar.student.applications") },
      { to: "/dashboard/company/interviews", icon: <FiCalendar/>,      label: t("sidebar.student.interviews") },
      { to: "/dashboard/company/messages",   icon: <FiMessageSquare/>, label: t("sidebar.student.messages") },
      { to: "/dashboard/company/stats",      icon: <FiPieChart/>,      label: t("common.view") },
      { to: "/dashboard/company/profile",    icon: <FiUser/>,          label: t("sidebar.student.profile") },
    ],
    encadrant: [
      { to: "/dashboard/supervisor",             icon: <FiHome/>,          label: t("sidebar.student.dashboard") },
      { to: "/dashboard/supervisor/students",    icon: <FiBookOpen/>,      label: t("sidebar.student.applications") },
      { to: "/dashboard/supervisor/follow-up",   icon: <FiCheckSquare/>,   label: t("common.view") },
      { to: "/dashboard/supervisor/documents",   icon: <FiFolder/>,        label: t("sidebar.student.documents") },
      { to: "/dashboard/supervisor/evaluations", icon: <FiFileText/>,      label: t("sidebar.student.applications") },
      { to: "/dashboard/supervisor/messages",    icon: <FiMessageSquare/>, label: t("sidebar.student.messages") },
      { to: "/dashboard/supervisor/profile",     icon: <FiUser/>,          label: t("sidebar.student.profile") },
    ],
    admin: [
      { to: "/dashboard/admin",              icon: <FiHome/>,        label: t("sidebar.student.dashboard") },
      { to: "/dashboard/admin/users",        icon: <FiUsers/>,       label: t("sidebar.student.profile") },
      { to: "/dashboard/admin/companies",    icon: <FiBriefcase/>,   label: t("sidebar.roles.entreprise") },
      { to: "/dashboard/admin/offers",       icon: <FiFileText/>,    label: t("sidebar.student.offers") },
      { to: "/dashboard/admin/applications", icon: <FiCheckSquare/>, label: t("sidebar.student.applications") },
      { to: "/dashboard/admin/stats",        icon: <FiPieChart/>,    label: t("common.view") },
      { to: "/dashboard/admin/settings",     icon: <FiSettings/>,    label: t("common.save") },
    ],
  };

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
        {t(`sidebar.roles.${user?.role}`)}
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
        <FiLogOut/> {t("sidebar.logout")}
      </button>
    </aside>
  );
}