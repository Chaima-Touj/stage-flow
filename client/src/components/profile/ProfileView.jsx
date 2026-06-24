// src/components/profile/ProfileView.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiEdit2,
  FiDownload,
  FiShare2,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiCircle,
  FiExternalLink,
  FiPlus,
  FiBriefcase,
  FiBookOpen,
  FiAward,
  FiGlobe,
  FiFileText,
  FiSearch,
  FiCpu,
  FiUpload,
  FiX,
  FiFile,
  FiCheck,
} from "react-icons/fi";

// ============================================================
// 1. CIRCULAR PROGRESS
// ============================================================
const CircularProgress = ({ pct = 0 }) => {
  const r = 44,
    cx = 54,
    cy = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <defs>
        <linearGradient id="pgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#pgGrad2)"
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">
        {pct}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#10B981" fontWeight="600">
        Excellent
      </text>
    </svg>
  );
};

// ============================================================
// 2. CHECK ITEM
// ============================================================
const CheckItem = ({ done, label }) => (
  <div className="sf-check-item">
    {done ? (
      <FiCheckCircle className="sf-check-icon done" />
    ) : (
      <FiCircle className="sf-check-icon" />
    )}
    <span className={`sf-check-label${done ? "" : " muted"}`}>{label}</span>
  </div>
);

// ============================================================
// 3. PROFILE STRENGTH
// ============================================================
const ProfileStrength = ({ profile }) => {
  const hasName = !!profile?.name;
  const hasEmail = !!profile?.email;
  const hasCv = !!profile?.cv?.fileName;
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const hasExp = (profile?.experience?.length ?? 0) > 0;
  const hasPortfolio = !!profile?.socialLinks?.portfolio;
  const hasLinkedIn = !!profile?.socialLinks?.linkedin;

  const checks = [
    { label: "Informations personnelles", done: hasName && hasEmail },
    { label: "CV ajouté", done: hasCv },
    { label: "Compétences ajoutées", done: hasSkills },
    { label: "Expériences ajoutées", done: hasExp },
    { label: "Portfolio ajouté", done: hasPortfolio },
    { label: "LinkedIn connecté", done: hasLinkedIn },
  ];

  const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  return (
    <div className="sf-strength-card">
      <p className="sf-strength-header">Profile Strength</p>
      <div className="sf-strength-circle">
        <CircularProgress pct={pct} />
      </div>
      <p className="sf-strength-status">
        {pct === 100 ? "Profil complet !" : "Votre profil est complet !"}
      </p>
      <div className="sf-strength-checklist">
        {checks.map((c) => (
          <CheckItem key={c.label} done={c.done} label={c.label} />
        ))}
      </div>
      <button className="sf-strength-btn">Améliorer encore</button>
    </div>
  );
};

// ============================================================
// 4. AI CAREER ASSISTANT
// ============================================================
const AICareerCard = ({ profile }) => {
  const firstName = profile?.firstName || profile?.name?.split(" ")[0] || "Utilisateur";

  return (
    <div className="sf-ai-card">
      <div className="sf-ai-header">
        <div className="sf-ai-title-row">
          <span style={{ fontSize: 20 }}>🤖</span>
          <span className="sf-ai-title">AI Career Assistant</span>
        </div>
        <span className="sf-ai-beta">Beta</span>
      </div>
      <p className="sf-ai-greeting">Bonjour {firstName} ! 👋</p>
      <p className="sf-ai-desc">
        Votre profil est très bon. Voici mes recommandations pour le rendre exceptionnel.
      </p>
      <div className="sf-ai-recs">
        {[
          "Ajoutez 2 compétences techniques",
          "Connectez votre profil GitHub",
          "Ajoutez un nouveau projet",
          "Préparez-vous à un entretien",
        ].map((r) => (
          <div key={r} className="sf-ai-rec">
            <div className="sf-ai-rec-dot" />
            <span>{r}</span>
          </div>
        ))}
      </div>
      <button className="sf-ai-optimize">Optimiser mon profil ✨</button>
    </div>
  );
};

// ============================================================
// 5. RECENT ACTIVITY
// ============================================================
const RecentActivityCard = () => {
  const items = [
    {
      icon: <FiFileText size={15} />,
      text: "CV mis à jour",
      time: "Aujourd'hui à 14:32",
      color: "#7C3AED",
      bg: "#EDE9FE",
    },
    {
      icon: <FiBriefcase size={15} />,
      text: "Nouvelle candidature",
      time: "Hier à 09:15",
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      icon: <FiBookOpen size={15} />,
      text: "Formation terminée",
      time: "2 jours avant",
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      icon: <FiSearch size={15} />,
      text: "Profil consulté",
      time: "3 jours avant",
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
  ];

  return (
    <div className="sf-activity-card">
      <div className="sf-activity-header">
        <span className="sf-activity-title">Activité récente</span>
        <button className="sf-link-btn">Voir tout</button>
      </div>
      <div className="sf-activity-list">
        {items.map((item, i) => (
          <div key={i} className="sf-activity-item">
            <div
              className="sf-activity-icon"
              style={{ color: item.color, background: item.bg }}
            >
              {item.icon}
            </div>
            <div className="sf-activity-info">
              <p className="sf-activity-text">{item.text}</p>
              <p className="sf-activity-time">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 6. FLOATING ROBOT
// ============================================================
const FloatingRobot = () => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="sf-robot-wrapper">
      <motion.div
        className="sf-robot-float"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="sf-robot-glow" />
        <div className="relative">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center">
            <FiCpu className="w-8 h-8 text-white" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ opacity: blink ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <div className="sf-robot-notif">3</div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// 7. SKILL BADGE
// ============================================================
const techIcons = {
  React: { bg: "#E8F4FE", color: "#61DAFB", icon: "⚛️" },
  "React.js": { bg: "#E8F4FE", color: "#61DAFB", icon: "⚛️" },
  "Node.js": { bg: "#E8F6E8", color: "#68A063", icon: "🟩" },
  MongoDB: { bg: "#E8F6E8", color: "#4DB33D", icon: "🍃" },
  Java: { bg: "#FFF0E8", color: "#ED8B00", icon: "☕" },
  "Spring Boot": { bg: "#E8F6E8", color: "#6DB33F", icon: "🌱" },
  Docker: { bg: "#E8F4FE", color: "#2496ED", icon: "🐋" },
  Git: { bg: "#FFE8E8", color: "#F05032", icon: "🔴" },
  JavaScript: { bg: "#FFFCE8", color: "#F7DF1E", icon: "JS" },
  "Tailwind CSS": { bg: "#E8FAFE", color: "#38BDF8", icon: "🌊" },
};

const SkillBadge = ({ name }) => {
  const cfg = techIcons[name] || { bg: "#F3F4F6", color: "#6B7280", icon: "•" };
  return (
    <div className="sf-skill-badge" style={{ background: cfg.bg }}>
      <span className="sf-skill-icon">{cfg.icon}</span>
      <span className="sf-skill-name">{name}</span>
    </div>
  );
};

// ============================================================
// 8. HELPERS
// ============================================================
const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

const langDots = (level) => {
  const map = {
    "Langue maternelle": 7,
    Courant: 6,
    Avancé: 5,
    "Avancé (B2)": 5,
    Intermédiaire: 4,
    "Intermédiaire (B1)": 3,
    Débutant: 2,
  };
  const filled = map[level] ?? 4;
  return Array.from({ length: 7 }, (_, i) => i < filled);
};

// ============================================================
// 9. TABS
// ============================================================
const TABS = [
  "Vue d'ensemble",
  "Informations",
  "Expériences",
  "Formation",
  "Compétences",
  "Certifications",
  "Paramètres",
];

// ============================================================
// 10. MAIN COMPONENT
// ============================================================
const ProfileView = ({ profile, onEdit, onCVUpload }) => {
  const [activeTab, setActiveTab] = useState("Vue d'ensemble");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const fileInputRef = useRef(null);

  // ✅ Fonction pour télécharger le CV
  const handleDownloadCV = () => {
    if (profile?.cv?.fileUrl) {
      window.open(profile.cv.fileUrl, '_blank');
    } else {
      alert("Aucun CV téléchargé.");
    }
  };

  // ✅ Fonction pour partager le profil
  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${profile.name}`,
        text: `Découvrez le profil de ${profile.name} sur StageFlow`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Lien copié dans le presse-papier !"))
        .catch(() => alert("Partagez le lien : " + window.location.href));
    }
  };

  // ✅ Fonction pour uploader un nouveau CV
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Veuillez sélectionner un fichier PDF ou Word (.doc, .docx)');
      e.target.value = '';
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5 Mo');
      e.target.value = '';
      return;
    }

    // Upload
    handleUploadCV(file);
  };

  // ✅ Upload du CV
  const handleUploadCV = async (file) => {
    setUploading(true);
    setUploadStatus(null);

    try {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('cv', file);

      // Appeler la fonction de callback passée par le parent
      if (onCVUpload) {
        await onCVUpload(formData);
        setUploadStatus('success');
        // Réinitialiser l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // Fallback: utiliser profileService directement
        const { profileService } = await import('../../services/profile.service');
        await profileService.updateProfile(formData);
        setUploadStatus('success');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      // Recharger le profil après upload
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Erreur lors de l\'upload du CV:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Supprimer le CV
  const handleDeleteCV = async () => {
    if (!confirm('Voulez-vous supprimer votre CV ?')) return;

    setUploading(true);
    try {
      const { profileService } = await import('../../services/profile.service');
      await profileService.updateProfile({ cv: { fileName: '', fileUrl: '' } });
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      alert('Erreur lors de la suppression du CV');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return <p style={{ color: "#6B7280", padding: "2rem" }}>Aucun profil disponible.</p>;
  }

  // ===== Données provenant UNIQUEMENT de la base de données =====
  const displayName = profile.name || 
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || 
    "Utilisateur";
  
  const initials = profile.firstName?.charAt(0)?.toUpperCase() || 
    profile.name?.charAt(0)?.toUpperCase() || 
    "U";

  const skills = profile.skills || [];
  const experiences = profile.experience || [];
  const formations = profile.educations || (profile.education ? [profile.education] : []);
  const certifications = profile.certifications || [];
  const languages = profile.languages || [];

  const university = profile.university || "";
  const specialty = profile.specialty || "";
  const location = profile.location || profile.city || "";
  const memberSince = profile.memberSince || profile.createdAt ? 
    new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : 
    "";

  // Info CV
  const hasCV = !!profile?.cv?.fileName;
  const cvFileName = profile?.cv?.fileName || "";

  return (
    <div className="sf-profile-root">
      {/* ─── BANNER ─── */}
      <div className="sf-banner">
        <div className="sf-banner-left">
          <div className="sf-avatar-wrap">
            <div className="sf-avatar-ring">
              {profile.photoUrl || profile.avatar ? (
                <img src={profile.photoUrl || profile.avatar} alt={displayName} className="sf-avatar-img" />
              ) : (
                <div className="sf-avatar-fallback">{initials}</div>
              )}
            </div>
            <div className="sf-avatar-dot" />
          </div>
          <div className="sf-banner-info">
            <div className="sf-banner-name-row">
              <h1 className="sf-banner-name">{displayName}</h1>
              <span className="sf-verified">✓</span>
            </div>
            <p className="sf-banner-title">
              {specialty ? `🎓 ${specialty}` : "🎓 Étudiant"}
            </p>
            <p className="sf-banner-univ">{university || ""}</p>
            <div className="sf-banner-meta">
              {location && (
                <span className="sf-banner-meta-item">
                  <FiMapPin size={13} /> {location}
                </span>
              )}
              {memberSince && (
                <span className="sf-banner-meta-item">
                  <FiCalendar size={13} /> Membre depuis {memberSince}
                </span>
              )}
            </div>
            <div className="sf-banner-actions">
              <button className="sf-btn-banner" onClick={onEdit}>
                <FiEdit2 size={14} /> Modifier le profil
              </button>
              <button className="sf-btn-banner" onClick={handleDownloadCV}>
                <FiDownload size={14} /> Télécharger CV
              </button>
              <button className="sf-btn-banner" onClick={handleShareProfile}>
                <FiShare2 size={14} /> Partager profil
              </button>
            </div>
          </div>
        </div>
        {/* 3D Hexagon */}
        <div className="sf-banner-3d">
          <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
            <defs>
              <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hexFace" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#6D28D9" />
                <stop offset="1" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
            <ellipse cx="110" cy="110" rx="90" ry="80" fill="url(#hexGlow)" />
            <ellipse cx="110" cy="130" rx="75" ry="18" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.6" />
            <circle cx="40" cy="70" r="5" fill="#EC4899" opacity="0.9" />
            <circle cx="40" cy="70" r="9" fill="#EC4899" opacity="0.2" />
            <circle cx="175" cy="55" r="4" fill="#A78BFA" opacity="0.9" />
            <circle cx="175" cy="55" r="7" fill="#A78BFA" opacity="0.2" />
            <circle cx="165" cy="155" r="3" fill="#60A5FA" opacity="0.8" />
            <polygon
              points="110,28 160,56 160,112 110,140 60,112 60,56"
              fill="url(#hexFace)"
              filter="drop-shadow(0 8px 24px rgba(124,58,237,0.5))"
            />
            <polygon points="110,18 162,48 110,78 58,48" fill="#8B5CF6" opacity="0.85" />
            <polyline points="88,84 104,100 130,72" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="110,28 135,42 110,56 85,42" fill="white" opacity="0.12" />
          </svg>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="sf-tabs-bar">
        {TABS.map((t) => (
          <button
            key={t}
            className={`sf-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── BODY GRID ─── */}
      <div className="sf-body-grid">
        {/* COL LEFT */}
        <div className="sf-col-left">
          {/* ✅ NOUVEAU : Section CV avec upload */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">
                <FiFileText className="inline mr-2" /> CV
              </span>
              {hasCV && (
                <button className="sf-link-btn" onClick={handleDownloadCV}>
                  Télécharger
                </button>
              )}
            </div>

            <div className="sf-cv-section">
              {hasCV ? (
                <div className="sf-cv-info">
                  <div className="sf-cv-file">
                    <FiFile className="sf-cv-icon" />
                    <span className="sf-cv-name">{cvFileName}</span>
                    <span className="sf-cv-badge">✓ Téléchargé</span>
                  </div>
                  <div className="sf-cv-actions">
                    <button 
                      className="sf-cv-upload-btn sf-cv-upload-btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <FiUpload size={14} /> {uploading ? 'Upload...' : 'Modifier'}
                    </button>
                    <button 
                      className="sf-cv-upload-btn sf-cv-upload-btn-danger"
                      onClick={handleDeleteCV}
                      disabled={uploading}
                    >
                      <FiX size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sf-cv-empty">
                  <div className="sf-cv-empty-icon">
                    <FiFileText size={32} />
                  </div>
                  <p className="sf-cv-empty-text">Aucun CV téléchargé</p>
                  <button 
                    className="sf-cv-upload-btn sf-cv-upload-btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <FiUpload size={14} /> {uploading ? 'Upload en cours...' : 'Télécharger un CV'}
                  </button>
                </div>
              )}

              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Status de l'upload */}
              {uploadStatus === 'success' && (
                <div className="sf-cv-status sf-cv-status-success">
                  <FiCheck size={16} /> CV téléchargé avec succès !
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="sf-cv-status sf-cv-status-error">
                  <FiX size={16} /> Erreur lors du téléchargement
                </div>
              )}
            </div>
          </div>

          {/* Compétences */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">Compétences</span>
              <button className="sf-link-btn">Voir toutes</button>
            </div>
            {skills.length > 0 ? (
              <>
                <div className="sf-skills-grid">
                  {skills.map((skill, idx) => (
                    <SkillBadge key={idx} name={skill.name} />
                  ))}
                </div>
                <div className="sf-skills-footer">
                  <div className="sf-skills-bar">
                    <div className="sf-skills-bar-fill" style={{ width: `${Math.min((skills.length / 10) * 100, 100)}%` }} />
                  </div>
                  <div className="sf-skills-count-row">
                    <span className="sf-skills-count">{skills.length} compétences</span>
                    <button className="sf-add-btn">
                      <FiPlus size={13} /> Ajouter
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="sf-empty-text">Aucune compétence ajoutée.</p>
            )}
          </div>

          {/* Formations */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">Formations</span>
              <button className="sf-link-btn">Voir toutes</button>
            </div>
            {formations.length > 0 ? (
              <div className="sf-timeline">
                {formations.map((f, i) => (
                  <div key={i} className="sf-timeline-item">
                    <div className="sf-timeline-dot" style={{ background: "#7C3AED" }}>
                      <span>🎓</span>
                    </div>
                    {i < formations.length - 1 && <div className="sf-timeline-line" />}
                    <div className="sf-timeline-content">
                      <div className="sf-timeline-header">
                        <span className="sf-timeline-title">
                          {f.degree || f.fieldOfStudy || "Diplôme"}
                        </span>
                        <span className="sf-status-badge" style={{ color: "#10B981", background: "#D1FAE5" }}>
                          {f.current ? "En cours" : "Diplômé"}
                        </span>
                      </div>
                      <p className="sf-timeline-sub">{f.institution || f.school || ""}</p>
                      <p className="sf-timeline-date">
                        {f.startDate && formatDate(f.startDate)}
                        {f.startDate && f.endDate && " - "}
                        {f.endDate && formatDate(f.endDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sf-empty-text">Aucune formation renseignée.</p>
            )}
          </div>
        </div>

        {/* COL MIDDLE */}
        <div className="sf-col-mid">
          {/* Expériences */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">Expériences</span>
              <button className="sf-link-btn">Voir toutes</button>
            </div>
            {experiences.length > 0 ? (
              <div className="sf-exp-list">
                {experiences.map((e, i) => (
                  <div key={e.id || i} className="sf-exp-item">
                    <div className="sf-exp-avatar" style={{ background: "#7C3AED" }}>
                      {e.company?.charAt(0)?.toUpperCase() || "E"}
                    </div>
                    <div className="sf-exp-content">
                      <p className="sf-exp-title">{e.position}</p>
                      <p className="sf-exp-company">{e.company}</p>
                      <p className="sf-exp-date">
                        {e.startDate && formatDate(e.startDate)}
                        {e.startDate && " · "}
                        {e.current ? "Présent" : e.endDate && formatDate(e.endDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sf-empty-text">Aucune expérience renseignée.</p>
            )}
          </div>

          {/* Certifications */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">Certifications</span>
              <button className="sf-link-btn">Voir toutes</button>
            </div>
            {certifications.length > 0 ? (
              <div className="sf-cert-list">
                {certifications.map((c, i) => (
                  <div key={i} className="sf-cert-item">
                    <div className="sf-cert-icon" style={{ background: "#EDE9FE" }}>
                      📜
                    </div>
                    <div className="sf-cert-info">
                      <p className="sf-cert-name">{c.name}</p>
                      <p className="sf-cert-org">{c.organization || c.issuer || ""}</p>
                    </div>
                    <span className="sf-cert-date">
                      {c.date && formatDate(c.date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sf-empty-text">Aucune certification renseignée.</p>
            )}
          </div>
        </div>

        {/* COL RIGHT */}
        <div className="sf-col-right">
          {/* Portfolio */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">Portfolio</span>
              <button className="sf-link-btn">Voir tout</button>
            </div>
            <div className="sf-portfolio-list">
              {profile.socialLinks?.portfolio ? (
                <div className="sf-portfolio-item">
                  <div className="sf-portfolio-img sf-portfolio-img-1" />
                  <div className="sf-portfolio-meta">
                    <p className="sf-portfolio-name">Portfolio</p>
                    <p className="sf-portfolio-desc">Mon portfolio en ligne</p>
                    <div className="sf-portfolio-tags">
                      <button className="sf-portfolio-ext">
                        <FiExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="sf-empty-text">Aucun portfolio ajouté.</p>
              )}
            </div>
          </div>

          {/* Langues */}
          <div className="sf-card">
            <div className="sf-card-header">
              <span className="sf-card-title">Langues</span>
            </div>
            {languages.length > 0 ? (
              <div className="sf-lang-list">
                {languages.map((l, i) => {
                  const dots = langDots(l.level);
                  return (
                    <div key={i} className="sf-lang-item">
                      <div className="sf-lang-info">
                        <span className="sf-lang-name">{l.name}</span>
                        <span className="sf-lang-level">{l.level}</span>
                      </div>
                      <div className="sf-lang-dots">
                        {dots.map((filled, j) => (
                          <div key={j} className={`sf-dot ${filled ? "filled" : ""}`} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="sf-empty-text">Aucune langue renseignée.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── SIDEBAR (Profile Strength, AI, Activity) ─── */}
      <div className="sf-sidebar-grid">
        <ProfileStrength profile={profile} />
        <AICareerCard profile={profile} />
        <RecentActivityCard />
      </div>

      {/* ─── ROBOT ─── */}
      <FloatingRobot />
    </div>
  );
};

export default ProfileView;