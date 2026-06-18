import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiChevronDown, FiSun, FiMoon, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth }  from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLang }  from "../../context/LangContext.jsx";
import { notificationsService } from "../../services/notifications.service.js";
import NotificationPanel from "./NotificationPanel.jsx";
import "./Topbar.css";

export default function Topbar({ title, subtitle }) {
  const { t }                  = useTranslation();
  const { user, logout }        = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const { lang, changeLang }    = useLang();
  const navigate                = useNavigate();

  const [showLang,  setShowLang]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser,  setShowUser]  = useState(false);
  const [notifications, setNotifications] = useState([]);

  const langRef  = useRef(null);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current  && !langRef.current.contains(e.target))  setShowLang(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = () => {
    notificationsService.getAll()
      .then(({ data }) => setNotifications(data.notifications))
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    await notificationsService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllRead();
    loadNotifications();
  };

  const handleDelete = async (id) => {
    await notificationsService.delete(id);
    loadNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {title && (
          <div>
            <h1 className="topbar-title">{title}</h1>
            {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="topbar-search">
        <FiSearch/>
        <input placeholder={t("topbar.searchPlaceholder")}/>
      </div>

      <div className="topbar-right">
        <div className="lang-dropdown" ref={langRef}>
          <button className="topbar-icon-btn" onClick={() => setShowLang((v) => !v)}>
            {lang.toUpperCase()}
          </button>
          {showLang && (
            <div className="lang-dropdown-menu">
              {["fr","en","ar"].map((l) => (
                <button key={l} type="button" onClick={() => { changeLang(l); setShowLang(false); }}
                  className={lang === l ? "lang-option-active" : ""}>
                  {l === "fr" ? "Français" : l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="topbar-icon-btn" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon/> : <FiSun/>}
        </button>

        <div className="notif-dropdown" ref={notifRef}>
          <button className="topbar-icon-btn topbar-bell" onClick={() => setShowNotif((v) => !v)}>
            <FiBell/>
            {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
          </button>
          {showNotif && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotif(false)}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div className="user-dropdown" ref={userRef}>
          <button className="topbar-user" onClick={() => setShowUser((v) => !v)}>
            <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name}</span>
              <span className="topbar-user-role">{t(`sidebar.roles.${user?.role}`)}</span>
            </div>
            <FiChevronDown size={14}/>
          </button>
          {showUser && (
            <div className="user-dropdown-menu">
              <button onClick={() => { navigate("/dashboard/student/profile"); setShowUser(false); }}>
                <FiUser size={14}/> {t("sidebar.student.profile")}
              </button>
              <button className="user-dropdown-logout" onClick={handleLogout}>
                <FiLogOut size={14}/> {t("sidebar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
