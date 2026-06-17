import { useState, useRef, useEffect } from "react";
import { FiSearch, FiBell, FiChevronDown, FiSun, FiMoon } from "react-icons/fi";
import { useAuth }  from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLang }  from "../../context/LangContext.jsx";
import "./Topbar.css";

export default function Topbar({ title, subtitle }) {
  const { user }               = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang }   = useLang();
  const [showLang, setShowLang] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLang(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <input placeholder="Rechercher une offre, un candidat..."/>
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

        <button className="topbar-icon-btn topbar-bell">
          <FiBell/>
          <span className="topbar-badge">3</span>
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name}</span>
            <span className="topbar-user-role">{user?.role}</span>
          </div>
          <FiChevronDown size={14}/>
        </div>
      </div>
    </header>
  );
}
