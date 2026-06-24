import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiArrowLeft, FiMapPin, FiBriefcase, FiClock, FiCalendar,
  FiBookmark, FiExternalLink, FiSend, FiShare2, FiCheck,
  FiGlobe, FiUsers, FiGrid, FiCode,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { offersService }        from "../../services/offers.service.js";
import { favoritesService }     from "../../services/favorites.service.js";
// eslint-disable-next-line no-unused-vars
import { applicationsService }  from "../../services/applications.service.js";
import "./OfferDetail.css";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const LOGO_PALETTES = [
  { bg:"#4F46E5", color:"#fff" },
  { bg:"#0EA5E9", color:"#fff" },
  { bg:"#10B981", color:"#fff" },
  { bg:"#F59E0B", color:"#fff" },
  { bg:"#EF4444", color:"#fff" },
  { bg:"#8B5CF6", color:"#fff" },
  { bg:"#EC4899", color:"#fff" },
  { bg:"#6366F1", color:"#fff" },
];

function logoStyle(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return LOGO_PALETTES[Math.abs(h) % LOGO_PALETTES.length];
}

function timeAgo(d) {
  if (!d) return "";
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return "Publié aujourd'hui";
  if (days === 1) return "Publié il y a 1 jour";
  return `Publié il y a ${days} jours`;
}

function toTitle(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const TABS = [
  { key:"description", label:"Description" },
  { key:"exigences",   label:"Exigences"   },
  { key:"avantages",   label:"Avantages"   },
  { key:"apropos",     label:"À propos"    },
  { key:"processus",   label:"Processus"   },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { t } = useTranslation();

  const [offer,       setOffer]       = useState(null);
  const [similar,     setSimilar]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saved,       setSaved]       = useState(false);
  const [activeTab,   setActiveTab]   = useState("description");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      offersService.getOne(id),
      favoritesService.getAll(),
    ]).then(([offRes, favRes]) => {
      const o = offRes.data.offer || offRes.data.offers?.[0] || offRes.data;
      if (!o || !o._id) throw new Error("Offre introuvable");
      setOffer(o);
      const favIds = new Set((favRes.data.favorites || []).map(f => f._id));
      setSaved(favIds.has(o._id));
      // Offres similaires
      return offersService.getAll({ domain: o.domain, limit: 4 })
        .then(simRes => {
          const all = simRes.data.offers || [];
          setSimilar(all.filter(s => s._id !== id).slice(0, 3));
        });
    }).catch(err => {
      console.error("Erreur chargement offre:", err);
    }).finally(() => setLoading(false));
  }, [id]);

  // Rediriger vers la page de candidature (CV + lettre de motivation)
  function handleApply() {
    navigate(`/dashboard/student/offers/${id}/apply`);
  }

  async function handleSave() {
    setSaved(v => !v);
    try { await favoritesService.toggle(id); }
    catch { setSaved(v => !v); }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: offer?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="od-loading">
          <div className="od-spinner"/>
          <p>Chargement de l'offre...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!offer) {
    return (
      <DashboardLayout>
        <div className="od-empty">
          <p>Offre introuvable.</p>
          <Link to="/dashboard/student/offers" className="od-back-link">
            ← Retour aux offres
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const ls   = logoStyle(offer.companyName || "");
  const skills = Array.isArray(offer.skills) ? offer.skills
    : Array.isArray(offer.motsCles) ? offer.motsCles : [];
  const missions = Array.isArray(offer.missions) ? offer.missions : [];
  const description = offer.description || offer.desc || "";

  return (
    <DashboardLayout>
      <div className="od-page">

        {/* ── Retour ────────────────────────────────────────────────────── */}
        <Link to="/dashboard/student/offers" className="od-back">
          <FiArrowLeft size={16}/> Retour aux offres
        </Link>

        {/* ── Layout 2 colonnes ─────────────────────────────────────────── */}
        <div className="od-layout">

          {/* ════════════════════ COLONNE GAUCHE ════════════════════ */}
          <div className="od-left">

            {/* ── Header card ─────────────────────────────────────── */}
            <div className="od-header-card">
              <div className="od-header-top">
                {/* Logo */}
                <div className="od-logo" style={{ background: ls.bg, color: ls.color }}>
                  {(offer.companyName || "?")[0].toUpperCase()}
                </div>

                {/* Infos */}
                <div className="od-header-info">
                  <span className="od-type-badge">{offer.type || "Stage"}</span>
                  <h1 className="od-title">{offer.title}</h1>
                  <div className="od-company">
                    <span>{offer.companyName}</span>
                    <span className="od-verified">✓</span>
                  </div>
                  <div className="od-badges">
                    {offer.location && (
                      <span className="od-badge"><FiMapPin size={12}/>{offer.location}</span>
                    )}
                    {offer.type && (
                      <span className="od-badge"><FiBriefcase size={12}/>{offer.type}</span>
                    )}
                    {offer.duration && (
                      <span className="od-badge"><FiClock size={12}/>{offer.duration}</span>
                    )}
                    <span className="od-badge">
                      <FiCalendar size={12}/>{timeAgo(offer.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Bookmark */}
                <button
                  className={`od-bookmark ${saved ? "od-bookmark--saved" : ""}`}
                  onClick={handleSave}
                >
                  <FiBookmark size={18} fill={saved ? "currentColor" : "none"}/>
                </button>
              </div>

              {/* ── Onglets ────────────────────────────────────────── */}
              <div className="od-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`od-tab ${activeTab === tab.key ? "od-tab--on" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Contenu onglet Description ──────────────────────── */}
            {activeTab === "description" && (
              <>
                {/* Description */}
                {description && (
                  <div className="od-card">
                    <h2 className="od-card-title">À propos du poste</h2>
                    <div className="od-description">
                      {description.split("\n").filter(Boolean).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {/* Missions */}
                    {missions.length > 0 && (
                      <div className="od-missions">
                        <h3 className="od-section-h">Missions principales</h3>
                        <ul className="od-mission-list">
                          {missions.map((m, i) => (
                            <li key={i} className="od-mission-item">
                              <span className="od-mission-check"><FiCheck size={13}/></span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="od-skills-section">
                        <h3 className="od-section-h">Technologies & Compétences</h3>
                        <div className="od-skills">
                          {skills.map(s => (
                            <span key={s} className="od-skill-chip">
                              <FiCode size={12}/>{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Informations du stage */}
                <div className="od-card">
                  <h2 className="od-card-title">Informations du stage</h2>
                  <div className="od-info-grid">
                    <div className="od-info-item">
                      <div className="od-info-item__ico"><FiBriefcase size={16}/></div>
                      <div>
                        <div className="od-info-item__lbl">Type de stage</div>
                        <div className="od-info-item__val">{offer.type || "—"}</div>
                      </div>
                    </div>
                    <div className="od-info-item">
                      <div className="od-info-item__ico"><FiMapPin size={16}/></div>
                      <div>
                        <div className="od-info-item__lbl">Localisation</div>
                        <div className="od-info-item__val">{offer.location || "—"}</div>
                      </div>
                    </div>
                    <div className="od-info-item">
                      <div className="od-info-item__ico"><FiGrid size={16}/></div>
                      <div>
                        <div className="od-info-item__lbl">Entreprise</div>
                        <div className="od-info-item__val">{offer.companyName || "—"}</div>
                      </div>
                    </div>
                    <div className="od-info-item">
                      <div className="od-info-item__ico"><FiCalendar size={16}/></div>
                      <div>
                        <div className="od-info-item__lbl">Date de publication</div>
                        <div className="od-info-item__val">{timeAgo(offer.createdAt)}</div>
                      </div>
                    </div>
                    <div className="od-info-item">
                      <div className="od-info-item__ico"><FiClock size={16}/></div>
                      <div>
                        <div className="od-info-item__lbl">Durée</div>
                        <div className="od-info-item__val">{offer.duration || "—"}</div>
                      </div>
                    </div>
                    <div className="od-info-item">
                      <div className="od-info-item__ico"><FiGrid size={16}/></div>
                      <div>
                        <div className="od-info-item__lbl">Catégorie</div>
                        <div className="od-info-item__val">{offer.domain || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Onglet Exigences */}
            {activeTab === "exigences" && (
              <div className="od-card">
                <h2 className="od-card-title">Exigences du poste</h2>
                {offer.requirements ? (
                  <div className="od-description">
                    {offer.requirements.split("\n").filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="od-empty-tab">Aucune exigence spécifiée.</p>
                )}
                {skills.length > 0 && (
                  <div className="od-skills" style={{marginTop:"1rem"}}>
                    {skills.map(s=>(
                      <span key={s} className="od-skill-chip"><FiCode size={12}/>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Onglet Avantages */}
            {activeTab === "avantages" && (
              <div className="od-card">
                <h2 className="od-card-title">Avantages</h2>
                {offer.benefits ? (
                  <div className="od-description">
                    {offer.benefits.split("\n").filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="od-empty-tab">Aucun avantage spécifié.</p>
                )}
              </div>
            )}

            {/* Onglet À propos */}
            {activeTab === "apropos" && (
              <div className="od-card">
                <h2 className="od-card-title">À propos de l'entreprise</h2>
                {offer.companyDescription ? (
                  <div className="od-description">
                    {offer.companyDescription.split("\n").filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="od-empty-tab">Aucune information sur l'entreprise.</p>
                )}
              </div>
            )}

            {/* Onglet Processus */}
            {activeTab === "processus" && (
              <div className="od-card">
                <h2 className="od-card-title">Processus de recrutement</h2>
                {offer.process ? (
                  <div className="od-description">
                    {offer.process.split("\n").filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <div className="od-process-steps">
                    {["Candidature en ligne","Étude du CV","Entretien technique","Décision finale"].map((step, i) => (
                      <div key={i} className="od-process-step">
                        <div className="od-process-step__num">{i + 1}</div>
                        <div className="od-process-step__lbl">{step}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ════════════════════ SIDEBAR DROITE ════════════════════ */}
          <aside className="od-right">

            {/* Card 1 — À propos de l'entreprise */}
            <div className="od-card od-card--company">
              <h3 className="od-sidebar-title">À propos de l'entreprise</h3>
              <div className="od-company-header">
                <div className="od-company-logo" style={{ background: ls.bg, color: ls.color }}>
                  {(offer.companyName || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="od-company-name">{offer.companyName}
                    <span className="od-verified" style={{marginLeft:4}}>✓</span>
                  </div>
                  <div className="od-company-type">{offer.companyType || "Agence Digitale"}</div>
                </div>
              </div>

              <div className="od-company-infos">
                {offer.website && (
                  <div className="od-company-info-row">
                    <FiGlobe size={14} className="od-company-info-ico"/>
                    <span className="od-company-info-lbl">Site web</span>
                    <a href={offer.website} target="_blank" rel="noreferrer" className="od-company-info-link">
                      {offer.website.replace(/https?:\/\//, "")} <FiExternalLink size={11}/>
                    </a>
                  </div>
                )}
                <div className="od-company-info-row">
                  <FiMapPin size={14} className="od-company-info-ico"/>
                  <span className="od-company-info-lbl">Localisation</span>
                  <span className="od-company-info-val">{offer.location || "—"}</span>
                </div>
                <div className="od-company-info-row">
                  <FiUsers size={14} className="od-company-info-ico"/>
                  <span className="od-company-info-lbl">Taille de l'équipe</span>
                  <span className="od-company-info-val">{offer.companySize || "10 – 50 employés"}</span>
                </div>
                <div className="od-company-info-row">
                  <FiGrid size={14} className="od-company-info-ico"/>
                  <span className="od-company-info-lbl">Secteur</span>
                  <span className="od-company-info-val">{offer.sector || offer.domain || "Technologie"}</span>
                </div>
              </div>

              <button className="od-btn-company-profile">
                Voir le profil de l'entreprise <span style={{marginLeft:4}}>›</span>
              </button>
            </div>

            {/* Card 2 — Postuler */}
            <div className="od-card od-card--apply">
              <h3 className="od-sidebar-title">Postuler à cette offre</h3>
              <p className="od-apply-sub">Envoyez votre candidature en quelques clics.</p>

              <button className="od-btn-apply" onClick={handleApply}>
                <FiSend size={16}/>
                Postuler maintenant
              </button>

              <button className={`od-btn-save ${saved?"od-btn-save--saved":""}`} onClick={handleSave}>
                <FiBookmark size={15} fill={saved?"currentColor":"none"}/>
                {saved ? "Enregistrée" : "Enregistrer l'offre"}
              </button>

              <button className="od-btn-share" onClick={handleShare}>
                <FiShare2 size={15}/>
                Partager cette offre
              </button>
            </div>

            {/* Card 3 — Offres similaires */}
            {similar.length > 0 && (
              <div className="od-card od-card--similar">
                <h3 className="od-sidebar-title">Offres similaires</h3>
                <div className="od-similar-list">
                  {similar.map(s => {
                    const sl = logoStyle(s.companyName || "");
                    return (
                      <Link key={s._id} to={`/dashboard/student/offers/${s._id}`} className="od-similar-item">
                        <div className="od-similar-logo" style={{ background: sl.bg, color: sl.color }}>
                          {(s.companyName || "?")[0].toUpperCase()}
                        </div>
                        <div className="od-similar-info">
                          <div className="od-similar-title">{toTitle(s.title)}</div>
                          <div className="od-similar-co">{s.companyName}</div>
                          {s.location && (
                            <div className="od-similar-loc">
                              <FiMapPin size={10}/> {s.location}
                            </div>
                          )}
                        </div>
                        <div className="od-similar-right">
                          <div className="od-similar-date">{timeAgo(s.createdAt).replace("Publié ","")} </div>
                          <button className="od-similar-bm" onClick={e => e.preventDefault()}>
                            <FiBookmark size={13}/>
                          </button>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link to="/dashboard/student/offers" className="od-similar-more">
                  Voir toutes les offres similaires <span>›</span>
                </Link>
              </div>
            )}

          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}