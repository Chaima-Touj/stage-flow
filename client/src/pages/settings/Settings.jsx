import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { profileService } from "../../services/profile.service.js";
import {
  FiUser, FiMoon, FiSun, FiBell, FiShield, FiLock, FiCpu,
  FiBriefcase, FiAlertTriangle, FiGlobe, FiCheck, FiX,
  FiSave, FiTrash2, FiEye, FiEyeOff, FiPlus, FiChevronRight,
  FiSmartphone, FiMail, FiBook, FiMessageSquare, FiCalendar,
} from "react-icons/fi";
import "./Settings.css";

// ─── Toast ──────────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className={`stg-toast stg-toast--${toast.type}`} onClick={onDismiss}>
      <span className="stg-toast__icon">
        {toast.type === "success" ? <FiCheck size={15}/> : <FiX size={15}/>}
      </span>
      <span className="stg-toast__msg">{toast.message}</span>
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`stg-toggle ${checked ? "stg-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="stg-toggle__knob"/>
    </button>
  );
}

// ─── Tag Input ───────────────────────────────────────────────────────────────

function TagInput({ tags, onAdd, onRemove, inputValue, onInputChange, placeholder }) {
  const handleKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue.trim());
    }
  };
  return (
    <div className="stg-tag-input">
      {tags.map((t, i) => (
        <span key={i} className="stg-tag">
          {t}
          <button type="button" onClick={() => onRemove(i)}><FiX size={11}/></button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="stg-tag-input__field"
      />
    </div>
  );
}

// ─── Password Field ──────────────────────────────────────────────────────────

function PwdField({ label, value, onChange, show, onToggleShow }) {
  return (
    <div className="stg-field">
      <label className="stg-label">{label}</label>
      <div className="stg-input-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="stg-input"
          autoComplete="new-password"
        />
        <button type="button" className="stg-input-eye" onClick={onToggleShow}>
          {show ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
        </button>
      </div>
    </div>
  );
}

// ─── Sections nav config ─────────────────────────────────────────────────────

const SECTIONS = [
  { id: "compte",           label: "Compte",          icon: FiUser },
  { id: "apparence",        label: "Apparence",        icon: FiSun },
  { id: "notifications",    label: "Notifications",    icon: FiBell },
  { id: "confidentialite",  label: "Confidentialité",  icon: FiShield },
  { id: "securite",         label: "Sécurité",         icon: FiLock },
  { id: "ia",               label: "IA StageFlow",     icon: FiCpu },
  { id: "preferences",      label: "Préf. Stage",      icon: FiBriefcase },
  { id: "danger",           label: "Zone Danger",      icon: FiAlertTriangle },
];

const LANGS = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "ar", label: "العربية",  flag: "🇹🇳" },
];

const FONT_SIZES = [
  { value: "small",  label: "Petite" },
  { value: "medium", label: "Normale" },
  { value: "large",  label: "Grande" },
];

const VISIBILITY_OPTIONS = [
  { value: "public",      label: "Public — visible par tous" },
  { value: "connections", label: "Connexions — uniquement vos contacts" },
  { value: "private",     label: "Privé — invisible" },
];

const STAGE_TYPES = ["", "Stage", "PFE", "Alternance", "CDI", "CDD"];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme }        = useTheme();
  const { lang, changeLang }          = useLang();
  const navigate                      = useNavigate();

  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeSection, setActiveSection] = useState("compte");
  const [toast,         setToast]         = useState(null);
  const [saving,        setSaving]        = useState(false);
  const toastTimer                        = useRef(null);

  // ── Section: Compte ──
  const [compteForm, setCompteForm] = useState({ name: "", phone: "", university: "", specialty: "" });

  // ── Section: Sécurité ──
  const [pwdForm, setPwdForm] = useState({ current: "", nouveau: "", confirm: "" });
  const [pwdShow, setPwdShow] = useState({ current: false, nouveau: false, confirm: false });

  // ── Section: Notifications ──
  const [notifs, setNotifs] = useState({
    newOffers: true, newApplications: true, interviews: true,
    messages: true, formations: true, emails: true,
  });

  // ── Section: Confidentialité ──
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public", cvVisibility: true, allowCompanyView: true,
  });

  // ── Section: IA ──
  const [aiPref, setAiPref] = useState({ enableRecommendations: true });

  // ── Section: Préférences Stage ──
  const [stagePrefs, setStagePrefs] = useState({ locations: [], type: "", technologies: [], duration: "" });
  const [locationInput, setLocationInput] = useState("");
  const [techInput,     setTechInput]     = useState("");

  // ── Section: Apparence ──
  const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");

  // ── Section: Zone Danger ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword,  setDeletePassword]  = useState("");
  const [showDeletePwd,   setShowDeletePwd]   = useState(false);

  // Apply font size globally
  useEffect(() => {
    const map = { small: "13px", medium: "15px", large: "17px" };
    document.documentElement.setAttribute("data-font-size", fontSize);
    document.documentElement.style.fontSize = map[fontSize];
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Load profile
  useEffect(() => {
    profileService.getMyProfile()
      .then(({ data }) => {
        const p = data.user || data;
        setProfile(p);
        setCompteForm({
          name:       p.name       || "",
          phone:      p.phone      || "",
          university: p.university || "",
          specialty:  p.specialty  || "",
        });
        if (p.settings?.notifications)       setNotifs(n  => ({ ...n,  ...p.settings.notifications }));
        if (p.settings?.privacy)             setPrivacy(pr => ({ ...pr, ...p.settings.privacy }));
        if (p.settings?.ai)                  setAiPref(a  => ({ ...a,  ...p.settings.ai }));
        if (p.settings?.internshipPreferences) {
          setStagePrefs(s => ({ ...s, ...p.settings.internshipPreferences }));
        }
      })
      .catch(() => showToast("error", "Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Save: Compte ──────────────────────────────────────────────────────────
  const saveCompte = async () => {
    if (!compteForm.name.trim()) return showToast("error", "Le nom est requis");
    setSaving(true);
    try {
      await profileService.updateProfile(compteForm);
      await refreshUser();
      showToast("success", "Informations mises à jour");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── Save: Mot de passe ────────────────────────────────────────────────────
  const savePassword = async () => {
    if (!pwdForm.current || !pwdForm.nouveau || !pwdForm.confirm)
      return showToast("error", "Tous les champs sont requis");
    if (pwdForm.nouveau.length < 6)
      return showToast("error", "Minimum 6 caractères");
    if (pwdForm.nouveau !== pwdForm.confirm)
      return showToast("error", "Les mots de passe ne correspondent pas");

    setSaving(true);
    try {
      await profileService.changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.nouveau });
      setPwdForm({ current: "", nouveau: "", confirm: "" });
      showToast("success", "Mot de passe modifié avec succès");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Mot de passe actuel incorrect");
    } finally {
      setSaving(false);
    }
  };

  // ── Save: Settings génériques ─────────────────────────────────────────────
  const saveSettings = async (payload) => {
    setSaving(true);
    try {
      await profileService.updateSettings(payload);
      showToast("success", "Paramètres sauvegardés");
    } catch {
      showToast("error", "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) return showToast("error", "Mot de passe requis");
    setSaving(true);
    try {
      await profileService.deleteAccount({ password: deletePassword });
      logout();
      navigate("/login");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Mot de passe incorrect");
    } finally {
      setSaving(false);
    }
  };

  // ── Tags helpers ──────────────────────────────────────────────────────────
  const addLocation = (val) => {
    if (!stagePrefs.locations.includes(val)) {
      setStagePrefs(s => ({ ...s, locations: [...s.locations, val] }));
    }
    setLocationInput("");
  };
  const removeLocation = (i) =>
    setStagePrefs(s => ({ ...s, locations: s.locations.filter((_, idx) => idx !== i) }));

  const addTech = (val) => {
    if (!stagePrefs.technologies.includes(val)) {
      setStagePrefs(s => ({ ...s, technologies: [...s.technologies, val] }));
    }
    setTechInput("");
  };
  const removeTech = (i) =>
    setStagePrefs(s => ({ ...s, technologies: s.technologies.filter((_, idx) => idx !== i) }));

  // ─── Render sections ──────────────────────────────────────────────────────

  const renderCompte = () => (
    <div className="stg-section">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--blue"><FiUser size={18}/></div>
        <div>
          <h2 className="stg-section__title">Compte</h2>
          <p className="stg-section__desc">Vos informations personnelles</p>
        </div>
      </div>

      <div className="stg-field-grid">
        <div className="stg-field">
          <label className="stg-label">Nom complet</label>
          <input
            className="stg-input"
            value={compteForm.name}
            onChange={e => setCompteForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="stg-field">
          <label className="stg-label">Email</label>
          <input className="stg-input stg-input--readonly" value={profile?.email || ""} readOnly/>
          <span className="stg-hint">L'email ne peut pas être modifié</span>
        </div>
        <div className="stg-field">
          <label className="stg-label">Téléphone</label>
          <input
            className="stg-input"
            value={compteForm.phone}
            onChange={e => setCompteForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+216 XX XXX XXX"
          />
        </div>
        <div className="stg-field">
          <label className="stg-label">Université</label>
          <input
            className="stg-input"
            value={compteForm.university}
            onChange={e => setCompteForm(f => ({ ...f, university: e.target.value }))}
            placeholder="Ex: ENIT, FST, INSAT..."
          />
        </div>
        <div className="stg-field stg-field--full">
          <label className="stg-label">Spécialité</label>
          <input
            className="stg-input"
            value={compteForm.specialty}
            onChange={e => setCompteForm(f => ({ ...f, specialty: e.target.value }))}
            placeholder="Ex: Génie Logiciel, Informatique..."
          />
        </div>
      </div>

      <div className="stg-actions">
        <button className="stg-btn stg-btn--primary" onClick={saveCompte} disabled={saving}>
          <FiSave size={15}/> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );

  const renderApparence = () => (
    <div className="stg-section">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--amber"><FiSun size={18}/></div>
        <div>
          <h2 className="stg-section__title">Apparence</h2>
          <p className="stg-section__desc">Personnalisez l'interface</p>
        </div>
      </div>

      <div className="stg-pref-row">
        <div className="stg-pref-row__info">
          <span className="stg-pref-row__label">Mode</span>
          <span className="stg-pref-row__sub">Clair ou sombre</span>
        </div>
        <div className="stg-theme-switch">
          <button
            className={`stg-theme-btn ${theme === "light" ? "stg-theme-btn--active" : ""}`}
            onClick={() => theme === "dark" && toggleTheme()}
          >
            <FiSun size={14}/> Clair
          </button>
          <button
            className={`stg-theme-btn ${theme === "dark" ? "stg-theme-btn--active" : ""}`}
            onClick={() => theme === "light" && toggleTheme()}
          >
            <FiMoon size={14}/> Sombre
          </button>
        </div>
      </div>

      <div className="stg-divider"/>

      <div className="stg-pref-row">
        <div className="stg-pref-row__info">
          <span className="stg-pref-row__label">Langue</span>
          <span className="stg-pref-row__sub">Langue d'affichage</span>
        </div>
        <div className="stg-lang-group">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`stg-lang-btn ${lang === l.code ? "stg-lang-btn--active" : ""}`}
              onClick={() => changeLang(l.code)}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stg-divider"/>

      <div className="stg-pref-row">
        <div className="stg-pref-row__info">
          <span className="stg-pref-row__label">Taille du texte</span>
          <span className="stg-pref-row__sub">Ajuste la taille de l'interface</span>
        </div>
        <div className="stg-font-group">
          {FONT_SIZES.map(f => (
            <button
              key={f.value}
              className={`stg-font-btn ${fontSize === f.value ? "stg-font-btn--active" : ""}`}
              onClick={() => setFontSize(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => {
    const items = [
      { key: "newOffers",       label: "Nouvelles offres",       sub: "Offres correspondant à votre profil",      Icon: FiBriefcase },
      { key: "newApplications", label: "Candidatures",           sub: "Mises à jour du statut de vos dossiers",  Icon: FiBook },
      { key: "interviews",      label: "Entretiens",             sub: "Rappels et confirmations d'entretiens",    Icon: FiCalendar },
      { key: "messages",        label: "Messages",               sub: "Nouveaux messages reçus",                  Icon: FiMessageSquare },
      { key: "formations",      label: "Formations",             sub: "Nouvelles formations disponibles",         Icon: FiBook },
      { key: "emails",          label: "Notifications par email",sub: "Recevoir un résumé par email",             Icon: FiMail },
    ];
    return (
      <div className="stg-section">
        <div className="stg-section__header">
          <div className="stg-section__icon stg-section__icon--green"><FiBell size={18}/></div>
          <div>
            <h2 className="stg-section__title">Notifications</h2>
            <p className="stg-section__desc">Choisissez les alertes à recevoir</p>
          </div>
        </div>

        <div className="stg-toggle-list">
          {items.map(({ key, label, sub, Icon }) => (
            <div key={key} className="stg-toggle-row">
              <div className="stg-toggle-row__icon"><Icon size={16}/></div>
              <div className="stg-toggle-row__info">
                <span className="stg-toggle-row__label">{label}</span>
                <span className="stg-toggle-row__sub">{sub}</span>
              </div>
              <Toggle
                checked={notifs[key]}
                onChange={v => setNotifs(n => ({ ...n, [key]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="stg-actions">
          <button className="stg-btn stg-btn--primary" onClick={() => saveSettings({ notifications: notifs })} disabled={saving}>
            <FiSave size={15}/> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    );
  };

  const renderConfidentialite = () => (
    <div className="stg-section">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--purple"><FiShield size={18}/></div>
        <div>
          <h2 className="stg-section__title">Confidentialité</h2>
          <p className="stg-section__desc">Contrôlez qui peut voir vos informations</p>
        </div>
      </div>

      <div className="stg-field">
        <label className="stg-label">Visibilité du profil</label>
        <select
          className="stg-select"
          value={privacy.profileVisibility}
          onChange={e => setPrivacy(p => ({ ...p, profileVisibility: e.target.value }))}
        >
          {VISIBILITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="stg-toggle-list" style={{ marginTop: "1rem" }}>
        <div className="stg-toggle-row">
          <div className="stg-toggle-row__icon"><FiEye size={16}/></div>
          <div className="stg-toggle-row__info">
            <span className="stg-toggle-row__label">Visibilité du CV</span>
            <span className="stg-toggle-row__sub">Les recruteurs peuvent consulter votre CV</span>
          </div>
          <Toggle checked={privacy.cvVisibility} onChange={v => setPrivacy(p => ({ ...p, cvVisibility: v }))}/>
        </div>
        <div className="stg-toggle-row">
          <div className="stg-toggle-row__icon"><FiBriefcase size={16}/></div>
          <div className="stg-toggle-row__info">
            <span className="stg-toggle-row__label">Consultation par les entreprises</span>
            <span className="stg-toggle-row__sub">Autoriser les entreprises à trouver votre profil</span>
          </div>
          <Toggle checked={privacy.allowCompanyView} onChange={v => setPrivacy(p => ({ ...p, allowCompanyView: v }))}/>
        </div>
      </div>

      <div className="stg-actions">
        <button className="stg-btn stg-btn--primary" onClick={() => saveSettings({ privacy })} disabled={saving}>
          <FiSave size={15}/> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );

  const renderSecurite = () => (
    <div className="stg-section">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--red"><FiLock size={18}/></div>
        <div>
          <h2 className="stg-section__title">Sécurité</h2>
          <p className="stg-section__desc">Protégez votre compte</p>
        </div>
      </div>

      <div className="stg-card-inner">
        <h3 className="stg-subsection-title">Changer le mot de passe</h3>
        <div className="stg-field-grid">
          <PwdField
            label="Mot de passe actuel"
            value={pwdForm.current}
            onChange={v => setPwdForm(f => ({ ...f, current: v }))}
            show={pwdShow.current}
            onToggleShow={() => setPwdShow(s => ({ ...s, current: !s.current }))}
          />
          <PwdField
            label="Nouveau mot de passe"
            value={pwdForm.nouveau}
            onChange={v => setPwdForm(f => ({ ...f, nouveau: v }))}
            show={pwdShow.nouveau}
            onToggleShow={() => setPwdShow(s => ({ ...s, nouveau: !s.nouveau }))}
          />
          <PwdField
            label="Confirmer le nouveau mot de passe"
            value={pwdForm.confirm}
            onChange={v => setPwdForm(f => ({ ...f, confirm: v }))}
            show={pwdShow.confirm}
            onToggleShow={() => setPwdShow(s => ({ ...s, confirm: !s.confirm }))}
          />
        </div>
        {pwdForm.nouveau && (
          <div className="stg-pwd-strength">
            <div className={`stg-pwd-bar ${pwdForm.nouveau.length >= 8 ? "stg-pwd-bar--strong" : pwdForm.nouveau.length >= 6 ? "stg-pwd-bar--medium" : "stg-pwd-bar--weak"}`}/>
            <span className="stg-hint">
              {pwdForm.nouveau.length >= 8 ? "Fort" : pwdForm.nouveau.length >= 6 ? "Moyen" : "Faible"}
            </span>
          </div>
        )}
        <div className="stg-actions">
          <button className="stg-btn stg-btn--primary" onClick={savePassword} disabled={saving}>
            <FiLock size={15}/> {saving ? "Modification…" : "Modifier le mot de passe"}
          </button>
        </div>
      </div>

      <div className="stg-card-inner stg-card-inner--muted" style={{ marginTop: "1rem" }}>
        <h3 className="stg-subsection-title">Sessions actives</h3>
        <div className="stg-session-row">
          <div className="stg-session-icon"><FiSmartphone size={18}/></div>
          <div className="stg-session-info">
            <span className="stg-session-name">Session actuelle</span>
            <span className="stg-session-sub">Navigateur Web — {new Date().toLocaleDateString("fr-FR")}</span>
          </div>
          <span className="stg-session-badge">Active</span>
        </div>
      </div>
    </div>
  );

  const renderIA = () => (
    <div className="stg-section">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--indigo"><FiCpu size={18}/></div>
        <div>
          <h2 className="stg-section__title">IA StageFlow</h2>
          <p className="stg-section__desc">Paramètres de l'assistant SAGE</p>
        </div>
      </div>

      <div className="stg-toggle-list">
        <div className="stg-toggle-row">
          <div className="stg-toggle-row__icon"><FiCpu size={16}/></div>
          <div className="stg-toggle-row__info">
            <span className="stg-toggle-row__label">Recommandations IA personnalisées</span>
            <span className="stg-toggle-row__sub">SAGE analyse votre profil pour suggérer des offres adaptées</span>
          </div>
          <Toggle
            checked={aiPref.enableRecommendations}
            onChange={v => setAiPref(a => ({ ...a, enableRecommendations: v }))}
          />
        </div>
      </div>

      <div className="stg-card-inner stg-card-inner--muted" style={{ marginTop: "1rem" }}>
        <h3 className="stg-subsection-title">Historique SAGE</h3>
        <p className="stg-body-text">
          L'historique de conversation est stocké localement dans votre navigateur.
          La réinitialisation supprime uniquement les messages affichés — vos données de profil restent intactes.
        </p>
        <button
          className="stg-btn stg-btn--ghost"
          style={{ marginTop: "0.75rem" }}
          onClick={() => {
            localStorage.removeItem("sage_history");
            showToast("success", "Historique SAGE réinitialisé");
          }}
        >
          <FiX size={14}/> Réinitialiser l'historique
        </button>
      </div>

      <div className="stg-actions">
        <button className="stg-btn stg-btn--primary" onClick={() => saveSettings({ ai: aiPref })} disabled={saving}>
          <FiSave size={15}/> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="stg-section">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--teal"><FiBriefcase size={18}/></div>
        <div>
          <h2 className="stg-section__title">Préférences Stage</h2>
          <p className="stg-section__desc">Aide SAGE à vous trouver les meilleures offres</p>
        </div>
      </div>

      <div className="stg-field-grid">
        <div className="stg-field stg-field--full">
          <label className="stg-label">Lieux souhaités</label>
          <TagInput
            tags={stagePrefs.locations}
            onAdd={addLocation}
            onRemove={removeLocation}
            inputValue={locationInput}
            onInputChange={setLocationInput}
            placeholder="Ex: Tunis, Sfax… (Entrée pour ajouter)"
          />
        </div>

        <div className="stg-field">
          <label className="stg-label">Type de stage</label>
          <select
            className="stg-select"
            value={stagePrefs.type}
            onChange={e => setStagePrefs(s => ({ ...s, type: e.target.value }))}
          >
            {STAGE_TYPES.map(t => (
              <option key={t} value={t}>{t || "— Sélectionner —"}</option>
            ))}
          </select>
        </div>

        <div className="stg-field">
          <label className="stg-label">Durée souhaitée</label>
          <input
            className="stg-input"
            value={stagePrefs.duration}
            onChange={e => setStagePrefs(s => ({ ...s, duration: e.target.value }))}
            placeholder="Ex: 3 mois, 6 mois..."
          />
        </div>

        <div className="stg-field stg-field--full">
          <label className="stg-label">Technologies préférées</label>
          <TagInput
            tags={stagePrefs.technologies}
            onAdd={addTech}
            onRemove={removeTech}
            inputValue={techInput}
            onInputChange={setTechInput}
            placeholder="Ex: React, Node.js… (Entrée pour ajouter)"
          />
        </div>
      </div>

      <div className="stg-actions">
        <button className="stg-btn stg-btn--primary" onClick={() => saveSettings({ internshipPreferences: stagePrefs })} disabled={saving}>
          <FiSave size={15}/> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );

  const renderDanger = () => (
    <div className="stg-section stg-section--danger">
      <div className="stg-section__header">
        <div className="stg-section__icon stg-section__icon--danger"><FiAlertTriangle size={18}/></div>
        <div>
          <h2 className="stg-section__title stg-section__title--danger">Zone Danger</h2>
          <p className="stg-section__desc">Actions irréversibles</p>
        </div>
      </div>

      <div className="stg-danger-card">
        <div className="stg-danger-card__info">
          <h3 className="stg-danger-card__title">Supprimer définitivement le compte</h3>
          <p className="stg-danger-card__desc">
            Cette action supprimera votre compte, vos candidatures, vos messages et toutes vos données.
            Cette opération est <strong>irréversible</strong>.
          </p>
        </div>
        <button className="stg-btn stg-btn--danger" onClick={() => setShowDeleteModal(true)}>
          <FiTrash2 size={14}/> Supprimer mon compte
        </button>
      </div>

      {showDeleteModal && (
        <div className="stg-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="stg-modal" onClick={e => e.stopPropagation()}>
            <div className="stg-modal__header">
              <div className="stg-modal__icon"><FiAlertTriangle size={22}/></div>
              <h3 className="stg-modal__title">Confirmer la suppression</h3>
            </div>
            <p className="stg-modal__body">
              Pour confirmer, entrez votre mot de passe. Cette action est <strong>définitive et irréversible</strong>.
            </p>
            <div className="stg-input-wrap" style={{ marginBottom: "1rem" }}>
              <input
                type={showDeletePwd ? "text" : "password"}
                className="stg-input"
                placeholder="Votre mot de passe"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
              />
              <button type="button" className="stg-input-eye" onClick={() => setShowDeletePwd(s => !s)}>
                {showDeletePwd ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
              </button>
            </div>
            <div className="stg-modal__footer">
              <button className="stg-btn stg-btn--ghost" onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}>
                Annuler
              </button>
              <button className="stg-btn stg-btn--danger" onClick={handleDeleteAccount} disabled={saving}>
                <FiTrash2 size={14}/> {saving ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "compte":          return renderCompte();
      case "apparence":       return renderApparence();
      case "notifications":   return renderNotifications();
      case "confidentialite": return renderConfidentialite();
      case "securite":        return renderSecurite();
      case "ia":              return renderIA();
      case "preferences":     return renderPreferences();
      case "danger":          return renderDanger();
      default:                return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Paramètres">
        <div className="stg-loading">
          <div className="stg-loading__spinner"/>
          <p>Chargement…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Paramètres">
      <div className="stg-root">
        <Toast toast={toast} onDismiss={() => setToast(null)}/>

        <div className="stg-layout">
          {/* ── Navigation latérale ── */}
          <nav className="stg-nav">
            <div className="stg-nav__profile">
              <div className="stg-nav__avatar">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="stg-nav__profile-info">
                <span className="stg-nav__profile-name">{user?.name}</span>
                <span className="stg-nav__profile-email">{user?.email}</span>
              </div>
            </div>

            <div className="stg-nav__sep"/>

            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`stg-nav__item ${activeSection === id ? "stg-nav__item--active" : ""} ${id === "danger" ? "stg-nav__item--danger" : ""}`}
                onClick={() => setActiveSection(id)}
              >
                <span className="stg-nav__item-icon"><Icon size={16}/></span>
                <span className="stg-nav__item-label">{label}</span>
                <FiChevronRight size={13} className="stg-nav__item-chevron"/>
              </button>
            ))}
          </nav>

          {/* ── Contenu de section ── */}
          <div className="stg-content">
            {renderSection()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
