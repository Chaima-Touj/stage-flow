import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome, FiBriefcase, FiBookOpen, FiCpu, FiFileText,
  FiCalendar, FiFolder, FiMessageSquare, FiBell, FiUser,
  FiSettings, FiLogOut, FiPlus, FiUpload,
  FiUsers, FiPieChart, FiCheckSquare,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Sidebar.css";

/* ─── Menus par rôle ─────────────────────────────────────────────────────── */
const MENUS = {
  étudiant: [
    { to: "/dashboard/student",               icon: <FiHome/>,         label: "Dashboard" },
    { to: "/dashboard/student/offers",        icon: <FiBriefcase/>,    label: "Offres de stage" },
    { to: "/dashboard/student/applications",  icon: <FiFileText/>,     label: "Mes candidatures" },
    { to: "/dashboard/student/interviews",    icon: <FiCalendar/>,     label: "Entretiens" },
    { to: "/dashboard/student/training",      icon: <FiBookOpen/>,     label: "Formations" },
    { to: "/dashboard/student/ai-assistant",  icon: <FiCpu/>,          label: "AI Assistant", badge: "NEW", badgeBg: "#EEF2FF", badgeColor: "#4F46E5" },
    { to: "/dashboard/student/messages",      icon: <FiMessageSquare/>,label: "Messages",     badge: "3",   badgeBg: "#4F46E5", badgeColor: "#fff" },
    { to: "/dashboard/student/notifications", icon: <FiBell/>,         label: "Notifications",badge: "5",   badgeBg: "#4F46E5", badgeColor: "#fff" },
  ],
  entreprise: [
    { to: "/dashboard/company",             icon: <FiHome/>,         label: "Dashboard" },
    { to: "/dashboard/company/offers",      icon: <FiBriefcase/>,    label: "Offres" },
    { to: "/dashboard/company/candidates",  icon: <FiUsers/>,        label: "Candidats" },
    { to: "/dashboard/company/interviews",  icon: <FiCalendar/>,     label: "Entretiens" },
    { to: "/dashboard/company/messages",    icon: <FiMessageSquare/>,label: "Messagerie" },
    { to: "/dashboard/company/stats",       icon: <FiPieChart/>,     label: "Statistiques" },
  ],
  encadrant: [
    { to: "/dashboard/supervisor",                icon: <FiHome/>,        label: "Dashboard" },
    { to: "/dashboard/supervisor/students",       icon: <FiBookOpen/>,    label: "Étudiants" },
    { to: "/dashboard/supervisor/follow-up",      icon: <FiCheckSquare/>, label: "Suivi" },
    { to: "/dashboard/supervisor/documents",      icon: <FiFolder/>,      label: "Documents" },
    { to: "/dashboard/supervisor/evaluations",    icon: <FiFileText/>,    label: "Évaluations" },
    { to: "/dashboard/supervisor/messages",       icon: <FiMessageSquare/>,label:"Messagerie" },
  ],
  admin: [
    { to: "/dashboard/admin",              icon: <FiHome/>,        label: "Dashboard" },
    { to: "/dashboard/admin/users",        icon: <FiUsers/>,       label: "Utilisateurs" },
    { to: "/dashboard/admin/companies",    icon: <FiBriefcase/>,   label: "Entreprises" },
    { to: "/dashboard/admin/offers",       icon: <FiFileText/>,    label: "Offres" },
    { to: "/dashboard/admin/applications", icon: <FiCheckSquare/>, label: "Candidatures" },
    { to: "/dashboard/admin/stats",        icon: <FiPieChart/>,    label: "Statistiques" },
    { to: "/dashboard/admin/settings",     icon: <FiSettings/>,    label: "Paramètres" },
  ],
};

/* ─── Actions rapides par rôle ───────────────────────────────────────────── */
const QUICK_ACTIONS = {
  étudiant: [
    { icon: <FiPlus/>,    label: "Nouvelle candidature", iconBg: "#EEF2FF", iconColor: "#4F46E5", to: "/dashboard/student/applications" },
    { icon: <FiUpload/>,  label: "Upload CV",            iconBg: "#DCFCE7", iconColor: "#16A34A", to: "/dashboard/student/documents" },
    { icon: <FiCalendar/>,label: "Planifier entretien",  iconBg: "#FEF3C7", iconColor: "#D97706", to: "/dashboard/student/interviews" },
  ],
  entreprise: [
    { icon: <FiPlus/>,   label: "Nouvelle offre",        iconBg: "#EEF2FF", iconColor: "#4F46E5", to: "/dashboard/company/offers/new" },
    { icon: <FiUsers/>,  label: "Rechercher talents",    iconBg: "#DCFCE7", iconColor: "#16A34A", to: "/dashboard/company/candidates" },
    { icon: <FiCalendar/>,label:"Planifier entretien",   iconBg: "#FEF3C7", iconColor: "#D97706", to: "/dashboard/company/interviews" },
  ],
  encadrant: [
    { icon: <FiPlus/>,   label: "Nouveau suivi",         iconBg: "#EEF2FF", iconColor: "#4F46E5", to: "/dashboard/supervisor/follow-up" },
    { icon: <FiUpload/>, label: "Upload document",       iconBg: "#DCFCE7", iconColor: "#16A34A", to: "/dashboard/supervisor/documents" },
  ],
  admin: [
    { icon: <FiPlus/>,   label: "Nouvel utilisateur",    iconBg: "#EEF2FF", iconColor: "#4F46E5", to: "/dashboard/admin/users" },
    { icon: <FiUpload/>, label: "Importer données",      iconBg: "#DCFCE7", iconColor: "#16A34A", to: "/dashboard/admin/users" },
  ],
};

/* ─── Routes compte par rôle ─────────────────────────────────────────────── */
const COMPTE_ROUTES = {
  étudiant:   { profile: "/dashboard/student/profile",    settings: "/dashboard/student/settings" },
  entreprise: { profile: "/dashboard/company/profile",    settings: "/dashboard/company/settings" },
  encadrant:  { profile: "/dashboard/supervisor/profile", settings: "/dashboard/supervisor/settings" },
  admin:      { profile: "/dashboard/admin/profile",      settings: "/dashboard/admin/settings" },
};

/* ─── Composant principal ────────────────────────────────────────────────── */
export default function Sidebar({ onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(() => {
    const v = localStorage.getItem("sb_main");
    return v !== null ? JSON.parse(v) : true;
  });

  useEffect(() => {
    localStorage.setItem("sb_main", JSON.stringify(open));
    if (onToggle) onToggle(open);
  }, [open, onToggle]);

  const role    = user?.role || "étudiant";
  const items   = MENUS[role]         || MENUS.étudiant;
  const actions = QUICK_ACTIONS[role] || QUICK_ACTIONS.étudiant;
  const compte  = COMPTE_ROUTES[role] || COMPTE_ROUTES.étudiant;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={`msb ${open ? "msb--open" : "msb--closed"}`}>

      {/* ── Header : logo + toggle ──────────────────────────────────────── */}
      <div className="msb__head">
        <div className="msb__logo">
          <div className="msb__logo-ico">🎓</div>
          {open && (
            <span className="msb__logo-txt">
              StageFlow <span className="msb__logo-pro">Pro</span>
            </span>
          )}
        </div>
        <button className="msb__toggle" onClick={() => setOpen(v => !v)} title={open ? "Réduire" : "Agrandir"}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Navigation principale ───────────────────────────────────────── */}
      <nav className="msb__nav">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length <= 3}
            title={!open ? item.label : undefined}
            className={({ isActive }) => `msb__item${isActive ? " msb__item--on" : ""}`}
          >
            <span className="msb__item-ico">{item.icon}</span>
            {open && <span className="msb__item-lbl">{item.label}</span>}
            {item.badge && (
              <span
                className="msb__badge"
                style={{
                  background:  item.badgeBg,
                  color:       item.badgeColor,
                  fontWeight:  item.badge === "NEW" ? 600 : 700,
                  fontSize:    item.badge === "NEW" ? "0.6rem" : "0.72rem",
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Séparateur ──────────────────────────────────────────────────── */}
      {open && <div className="msb__sep"/>}

      {/* ── Actions rapides ─────────────────────────────────────────────── */}
      {open && (
        <div className="msb__section">
          <p className="msb__section-ttl">ACTIONS RAPIDES</p>
          {actions.map((a, i) => (
            <button key={i} className="msb__action" onClick={() => navigate(a.to)} title={a.label}>
              <span className="msb__action-ico" style={{ background: a.iconBg, color: a.iconColor }}>
                {a.icon}
              </span>
              <span className="msb__action-lbl">{a.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Séparateur ──────────────────────────────────────────────────── */}
      {open && <div className="msb__sep"/>}

      {/* ── Compte ──────────────────────────────────────────────────────── */}
      {open && (
        <div className="msb__section">
          <p className="msb__section-ttl">COMPTE</p>
          <NavLink to={compte.profile} className={({isActive}) => `msb__item${isActive?" msb__item--on":""}`}>
            <span className="msb__item-ico"><FiUser/></span>
            <span className="msb__item-lbl">Mon profil</span>
          </NavLink>
          <NavLink to={compte.settings} className={({isActive}) => `msb__item${isActive?" msb__item--on":""}`}>
            <span className="msb__item-ico"><FiSettings/></span>
            <span className="msb__item-lbl">Paramètres</span>
          </NavLink>
        </div>
      )}

      {/* ── Déconnexion ─────────────────────────────────────────────────── */}
      <button className="msb__logout" onClick={handleLogout} title={!open ? "Déconnexion" : undefined}>
        <span className="msb__logout-ico"><FiLogOut size={17}/></span>
        {open && <span className="msb__logout-lbl">Déconnexion</span>}
      </button>

    </aside>
  );
}