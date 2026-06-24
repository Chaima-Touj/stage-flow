/* eslint-disable react-hooks/purity */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import {
  FiFileText, FiClock, FiCheckCircle, FiArrowRight, FiMapPin,
  FiBriefcase, FiCalendar, FiSend, FiX, FiTrendingUp,
  FiStar, FiActivity, FiPlay, FiBookOpen,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { offersService } from "../../services/offers.service.js";
import { aiService } from "../../services/ai.service.js";
import api from "../../services/api.js";
import "./StudentDashboard.css";

const COLORS = ["#F59E0B", "#2563EB", "#8B5CF6", "#10B981", "#EF4444"];

const normalizeOffer = (o) => ({
  ...o,
  companyName: o.companyName || o.company || "Entreprise",
  skills: (o.skills?.length ? o.skills : o.motsCles) || [],
  location: o.location || "",
});

const SPARK = [
  [{v:2},{v:5},{v:4},{v:7},{v:6},{v:9}],
  [{v:3},{v:2},{v:5},{v:4},{v:6},{v:5}],
  [{v:1},{v:3},{v:2},{v:5},{v:4},{v:6}],
  [{v:4},{v:6},{v:5},{v:7},{v:8},{v:9}],
];

const FORMATION_ICONS = {
  react:   { bg:"#61DAFB20", icon:"⚛️" },
  node:    { bg:"#68A06320", icon:"🟢" },
  design:  { bg:"#F24E1E20", icon:"🎨" },
  git:     { bg:"#F0502720", icon:"🐙" },
  python:  { bg:"#3776AB20", icon:"🐍" },
  flutter: { bg:"#54C5F820", icon:"📱" },
};

/* ─── Robot animé ─────────────────────────────────────────────────────────── */
function AnimatedRobot({ size = 80 }) {
  return (
    <div className="ai-robot" style={{width:size, height:size}}>
      <div className="ai-robot__body">
        <div className="ai-robot__head">
          <div className="ai-robot__eye ai-robot__eye--left"/>
          <div className="ai-robot__eye ai-robot__eye--right"/>
          <div className="ai-robot__mouth"/>
          <div className="ai-robot__antenna"/>
        </div>
        <div className="ai-robot__torso">
          <div className="ai-robot__screen">
            <div className="ai-robot__screen-dot"/>
            <div className="ai-robot__screen-dot"/>
          </div>
        </div>
        <div className="ai-robot__arms">
          <div className="ai-robot__arm ai-robot__arm--left"/>
          <div className="ai-robot__arm ai-robot__arm--right"/>
        </div>
      </div>
      <div className="ai-robot__glow"/>
    </div>
  );
}

/* ─── Chatbot IA ──────────────────────────────────────────────────────────── */
function AIChatbot({ user }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Bonjour ${user?.name?.split(" ")[0] || ""} ! 👋\nJe suis StageFlow AI. Je peux vous aider avec :\n• 🎯 Recommandations de stages\n• ✉️ Lettre de motivation\n• 💼 Conseils carrière\n• 🔍 Analyse de votre profil\n\nQue puis-je faire pour vous ?`
    }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [recs,    setRecs]    = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");
    setRecs(null);
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      if (content.toLowerCase().includes("recommand") || content.toLowerCase().includes("stage")) {
        const { data } = await api.post("/ai/recommendations", { limit: 3 });
        setRecs(data.offers?.slice(0, 3) || []);
        setMessages([...newMessages, {
          role: "assistant",
          content: data.analysis || "Voici mes recommandations de stages pour vous !"
        }]);
        return;
      }
      const { data } = await aiService.chat(
        newMessages.map(m => ({ role: m.role, content: m.content }))
      );
      setMessages([...newMessages, {
        role: "assistant",
        content: data.result?.text || "Je n'ai pas pu traiter votre demande."
      }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "❌ Erreur de connexion. Vérifiez que le serveur est actif."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "🎯 Recommandations", text: "Recommande-moi des stages adaptés à mon profil" },
    { label: "💼 Conseils CV",      text: "Donne-moi des conseils pour améliorer mon profil" },
    { label: "✉️ Lettre",           text: "Comment rédiger une bonne lettre de motivation ?" },
    { label: "🔍 Entretien",        text: "Comment me préparer pour un entretien de stage ?" },
  ];

  return (
    <>
      {/* Bouton flottant avec robot animé */}
      {!open && (
        <button className="ai-fab" onClick={() => setOpen(true)} title="StageFlow AI">
          <AnimatedRobot size={44}/>
          <span className="ai-fab__badge">IA</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="ai-panel">
          {/* Header gradient */}
          <div className="ai-panel__header">
            <div className="ai-panel__header-left">
              <AnimatedRobot size={52}/>
              <div>
                <div className="ai-panel__name">StageFlow AI ✨</div>
                <div className="ai-panel__status">
                  <span className="ai-panel__dot"/> En ligne
                </div>
              </div>
            </div>
            <button className="ai-panel__close" onClick={() => setOpen(false)}>
              <FiX size={18}/>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-panel__messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg--${m.role}`}>
                {m.role === "assistant" && (
                  <div className="ai-msg__bot-icon">🤖</div>
                )}
                <div className="ai-msg__bubble">
                  {m.content.split("\n").map((line, j) => (
                    <p key={j} style={{margin:"0 0 2px"}}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Offres recommandées */}
            {recs && recs.length > 0 && (
              <div className="ai-recs">
                {recs.map(offer => (
                  <Link key={offer._id} to={`/dashboard/student/offers/${offer._id}`}
                    className="ai-rec-card" onClick={() => setRecs(null)}>
                    <div className="ai-rec-logo">
                      {offer.companyName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="ai-rec-info">
                      <div className="ai-rec-title">{offer.title}</div>
                      <div className="ai-rec-company">{offer.companyName}</div>
                      {offer.location && (
                        <div className="ai-rec-loc"><FiMapPin size={10}/> {offer.location}</div>
                      )}
                    </div>
                    <FiArrowRight size={13} style={{color:"var(--text-muted)"}}/>
                  </Link>
                ))}
              </div>
            )}

            {/* Typing */}
            {loading && (
              <div className="ai-msg ai-msg--assistant">
                <div className="ai-msg__bot-icon">🤖</div>
                <div className="ai-msg__bubble ai-typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="ai-quick-actions">
              {quickActions.map(a => (
                <button key={a.label} className="ai-quick-btn"
                  onClick={() => sendMessage(a.text)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Suggestion IA */}
          {messages.length > 1 && (
            <div className="ai-suggestion-bar">
              <div className="ai-suggestion-robot"><AnimatedRobot size={36}/></div>
              <p className="ai-suggestion-text">
                💡 La préparation d'aujourd'hui fait le succès de demain.
              </p>
            </div>
          )}

          {/* Input */}
          <div className="ai-panel__footer">
            <input
              className="ai-panel__input"
              placeholder="Posez votre question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button className="ai-panel__send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}>
              <FiSend size={16}/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [offers,        setOffers]        = useState([]);
  const [formations,    setFormations]    = useState([]);
  const [applications,  setApplications]  = useState([]);
  const [interviews,    setInterviews]    = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      offersService.getAll({ limit: 3 }),
      api.get("/offers?type=formation&limit=4"),
      api.get("/applications"),
      api.get("/interviews"),
      api.get("/notifications"),
    ]).then(([offersRes, formRes, appsRes, intRes, notifRes]) => {
      setOffers((offersRes.data.offers || []).filter(o => o.type !== "formation").slice(0, 3).map(normalizeOffer));
      setFormations((formRes.data.offers || []).slice(0, 4));
      setApplications(appsRes.data.applications || []);
      setInterviews(intRes.data.interviews || []);
      setNotifications(notifRes.data.notifications || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const counts = {
    total:      applications.length,
    enAttente:  applications.filter(a => a.status === "en attente").length,
    enCours:    applications.filter(a => a.status === "en cours").length,
    acceptee:   applications.filter(a => a.status === "acceptée").length,
    refusee:    applications.filter(a => a.status === "refusée").length,
    entretiens: interviews.length,
  };

  const stats = [
    { label:"Candidatures", sub:"Total envoyées",     value:counts.total,      color:"#2563EB", icon:<FiBriefcase size={20}/>, trend:"+20%", si:0 },
    { label:"En attente",   sub:"En attente de réponse", value:counts.enAttente, color:"#F59E0B", icon:<FiClock size={20}/>,     trend:"+15%", si:1 },
    { label:"Entretiens",   sub:"Planifiés",           value:counts.entretiens, color:"#8B5CF6", icon:<FiCalendar size={20}/>,  trend:"+10%", si:2 },
    { label:"Acceptées",    sub:"Offres acceptées",    value:counts.acceptee,   color:"#10B981", icon:<FiCheckCircle size={20}/>,trend:"+25%",si:3 },
  ];

  const pieData = [
    { name:"En attente", value:counts.enAttente },
    { name:"En revue",   value:counts.enCours },
    { name:"Entretiens", value:counts.entretiens },
    { name:"Acceptées",  value:counts.acceptee },
    { name:"Refusées",   value:counts.refusee },
  ].filter(d => d.value > 0);

  const recentActivity = [
    ...applications.slice(0,3).map(a => ({
      icon:"📄", color:"#2563EB",
      text:`Votre candidature a été envoyée à ${a.offerId?.companyName || "une entreprise"}`,
      time: a.createdAt ? `Il y a ${Math.floor((Date.now()-new Date(a.createdAt))/86400000)} jour(s)` : "Récent",
    })),
    ...notifications.slice(0,2).map(n => ({
      icon:"🔔", color:"#F59E0B", text:n.message,
      time: n.createdAt ? `Il y a ${Math.floor((Date.now()-new Date(n.createdAt))/86400000)} jour(s)` : "Récent",
    })),
  ].slice(0, 5);

  const firstName = user?.name?.split(" ")[0] || "Étudiant";

  return (
    <DashboardLayout
      title={`Bonjour, ${firstName} 👋`}
      subtitle="Ravi de vous revoir ! Voici un aperçu de votre activité."
    >
      <div className="sd-root">

        {/* Stats */}
        <div className="sd-stats">
          {stats.map((s, i) => (
            <div key={i} className="sd-stat-card">
              <div className="sd-stat-top">
                <div className="sd-stat-icon" style={{background:s.color+"18",color:s.color}}>{s.icon}</div>
                <div className="sd-stat-trend" style={{color:"#10B981"}}><FiTrendingUp size={11}/> {s.trend}</div>
              </div>
              <div className="sd-stat-value">{loading ? "…" : s.value}</div>
              <div className="sd-stat-label">{s.label}</div>
              <div className="sd-stat-sub">{s.sub}</div>
              <div className="sd-stat-spark">
                <ResponsiveContainer width="100%" height={36}>
                  <LineChart data={SPARK[s.si]}>
                    <Line type="monotone" dataKey="v" stroke={s.color} strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Offres recommandées */}
        <div className="sd-card">
          <div className="sd-row-header">
            <h2 className="sd-title">Offres recommandées pour vous</h2>
            <Link to="/dashboard/student/offers" className="sd-link-more">Voir toutes <FiArrowRight size={13}/></Link>
          </div>
          <div className="sd-offers-grid">
            {loading ? [1,2,3].map(i => <div key={i} className="sd-skeleton" style={{height:160}}/>)
            : offers.length === 0 ? <p className="sd-empty">Aucune offre disponible.</p>
            : offers.map(o => (
              <Link key={o._id} to={`/dashboard/student/offers/${o._id}`} className="sd-offer-card">
                <div className="sd-offer-top">
                  <div className="sd-offer-logo">{o.companyName?.[0]?.toUpperCase()||"?"}</div>
                  <button className="sd-offer-bm" onClick={e=>e.preventDefault()}><FiStar size={15}/></button>
                </div>
                <div className="sd-offer-title">{o.title}</div>
                <div className="sd-offer-company">{o.companyName}</div>
                {o.location && <div className="sd-offer-loc"><FiMapPin size={11}/> {o.location}</div>}
                <div className="sd-offer-skills">
                  {o.skills.slice(0,3).map(s=><span key={s} className="sd-badge">{s}</span>)}
                </div>
                <div className="sd-offer-footer">
                  <span className="sd-offer-time">
                    {o.createdAt ? `Il y a ${Math.floor((Date.now()-new Date(o.createdAt))/86400000)} j` : "Récent"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Candidatures + Entretiens */}
        <div className="sd-grid2">

          {/* Donut */}
          <div className="sd-card">
            <h2 className="sd-title" style={{marginBottom:"1rem"}}>Suivi de mes candidatures</h2>
            {pieData.length === 0 ? (
              <div className="sd-empty-box">
                <FiFileText size={28} style={{opacity:0.3}}/>
                <p>Aucune candidature</p>
                <Link to="/dashboard/student/offers" className="sd-btn-blue">Parcourir les offres</Link>
              </div>
            ) : (
              <div className="sd-pie-row">
                <ResponsiveContainer width="50%" height={170}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {pieData.map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="sd-pie-legend">
                  {pieData.map((d,i) => (
                    <div key={i} className="sd-pie-item">
                      <span className="sd-pie-dot" style={{background:COLORS[i]}}/>
                      <span className="sd-pie-name">{d.name}</span>
                      <strong>{d.value}</strong>
                      <span className="sd-pie-pct" style={{color:COLORS[i]}}>
                        ({counts.total>0?Math.round(d.value/counts.total*100):0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entretiens */}
          <div className="sd-card">
            <h2 className="sd-title" style={{marginBottom:"1rem"}}>Prochains entretiens</h2>
            {interviews.length === 0 ? (
              <div className="sd-empty-box">
                <FiCalendar size={28} style={{opacity:0.3}}/>
                <p>Aucun entretien planifié</p>
              </div>
            ) : interviews.slice(0,3).map(iv => (
              <div key={iv._id} className="sd-iv-item">
                <div className="sd-iv-icon"><FiCalendar size={15}/></div>
                <div className="sd-iv-info">
                  <div className="sd-iv-title">{iv.applicationId?.offerId?.title || "Entretien"}</div>
                  <div className="sd-iv-company">{iv.companyId?.name || "Entreprise"}</div>
                  <div className="sd-iv-date">
                    📅 {new Date(iv.scheduledAt).toLocaleString("fr-FR",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
                <span className={`sd-mode-badge ${iv.mode==="présentiel"?"sd-mode--pres":"sd-mode--online"}`}>
                  {iv.mode==="présentiel"?"Présentiel":"En ligne"}
                </span>
              </div>
            ))}
            {interviews.length > 0 && (
              <Link to="/dashboard/student/interviews" className="sd-link-more" style={{marginTop:"0.75rem"}}>
                Voir tous les entretiens <FiArrowRight size={13}/>
              </Link>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className="sd-card">
          <div className="sd-row-header">
            <h2 className="sd-title">Activité récente</h2>
            <Link to="/dashboard/student/applications" className="sd-link-more">Voir toute l'activité <FiArrowRight size={13}/></Link>
          </div>
          {recentActivity.length === 0
            ? <p className="sd-empty">Aucune activité récente.</p>
            : recentActivity.map((a,i) => (
              <div key={i} className="sd-act-item">
                <div className="sd-act-icon" style={{background:a.color+"18",color:a.color}}>
                  <FiActivity size={13}/>
                </div>
                <div className="sd-act-text">{a.text}</div>
                <div className="sd-act-time">{a.time}</div>
              </div>
            ))}
        </div>

        {/* Formations recommandées — 9antra.tn */}
        <div className="sd-card">
          <div className="sd-row-header">
            <div>
              <h2 className="sd-title">Formations recommandées pour vous</h2>
              <p style={{fontSize:"0.8rem",color:"var(--text-muted)",margin:"0.1rem 0 0"}}>
                Propulsé par <strong style={{color:"var(--primary)"}}>9antra.tn</strong>
              </p>
            </div>
            <a href="https://9antra.tn" target="_blank" rel="noreferrer" className="sd-link-more">
              Voir toutes les formations <FiArrowRight size={13}/>
            </a>
          </div>

          {loading ? (
            <div className="sd-form-grid">
              {[1,2,3,4].map(i => <div key={i} className="sd-skeleton" style={{height:140}}/>)}
            </div>
          ) : formations.length === 0 ? (
            <p className="sd-empty">Aucune formation disponible. Lancez le script seed_formations.mjs.</p>
          ) : (
            <div className="sd-form-grid">
              {formations.map((f, i) => {
                const fmt = FORMATION_ICONS[f.image] || { bg:"#2563EB20", icon:"📚" };
                const pct = f.progress ?? 0;
                return (
                  <div key={f._id || i} className="sd-form-card">
                    <div className="sd-form-card__logo" style={{background:fmt.bg}}>
                      <span style={{fontSize:"1.75rem"}}>{fmt.icon}</span>
                    </div>
                    <div className="sd-form-card__title">{f.title}</div>
                    <div className="sd-form-card__meta">
                      <span>📚 {f.modules || "–"} modules</span>
                    </div>
                    <div className="sd-form-card__bar-wrap">
                      <div className="sd-form-card__bar">
                        <div className="sd-form-card__fill"
                          style={{width:`${pct}%`, background: pct===100?"#10B981":pct>50?"#2563EB":"#F59E0B"}}/>
                      </div>
                      <span className="sd-form-card__pct">{pct}%</span>
                    </div>
                    <button className={`sd-form-card__btn ${pct===100?"sd-form-card__btn--done":pct>0?"sd-form-card__btn--cont":"sd-form-card__btn--start"}`}>
                      {pct===100 ? "Terminée ✓" : pct>0 ? <><FiPlay size={13}/> Continuer</> : <><FiBookOpen size={13}/> Commencer</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="sd-card">
          <div className="sd-row-header">
            <h2 className="sd-title">Suggestions pour vous</h2>
          </div>
          <div className="sd-suggestions">
            {[
              { icon:"📄", text:"Complétez votre profil à 80%",          pct: user?.bio?80:40,                                    color:"#2563EB" },
              { icon:"💼", text:"Ajoutez vos compétences",                pct: user?.skills?.length>0?Math.min(100,user.skills.length*20):10, color:"#10B981" },
              { icon:"📅", text:"Préparez-vous pour votre entretien",     pct: interviews.length>0?60:20,                          color:"#F59E0B" },
            ].map((s,i) => (
              <div key={i} className="sd-sugg-item">
                <div className="sd-sugg-icon">{s.icon}</div>
                <div className="sd-sugg-content">
                  <div className="sd-sugg-text">{s.text}</div>
                  <div className="sd-sugg-bar">
                    <div className="sd-sugg-fill" style={{width:`${s.pct}%`,background:s.color}}/>
                  </div>
                </div>
                <span className="sd-sugg-pct" style={{color:s.color}}>{s.pct}%</span>
                <FiArrowRight size={13} style={{color:"var(--text-muted)"}}/>
              </div>
            ))}
          </div>
        </div>

      </div>

      <AIChatbot user={user}/>
    </DashboardLayout>
  );
}