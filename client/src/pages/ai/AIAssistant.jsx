// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiFileText, FiMic, FiSend, FiPlus,
  FiClock, FiZap, FiTrendingUp, FiStar, FiBarChart2,
  // eslint-disable-next-line no-unused-vars
  FiChevronRight, FiShield, FiBook,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { aiService } from "../../services/ai.service.js";
import "./AIAssistant.css";

/* ── Robot 3D interactif ──────────────────────────────────────────────────── */
function Robot3D() {
  const containerRef = useRef(null);
  const [pupils, setPupils]   = useState({ x: 0, y: 0 });
  const [blink, setBlink]     = useState(false);
  const [hover, setHover]     = useState(false);
  const [talking, setTalking] = useState(false);

  // Eye tracking
  useEffect(() => {
    function onMove(e) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setPupils({
        x: Math.max(-6, Math.min(6, dx * 12)),
        y: Math.max(-5, Math.min(5, dy * 10)),
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Auto-blink
  useEffect(() => {
    function schedBlink() {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedBlink(); }, 160);
      }, delay);
    }
    const t = schedBlink();
    return () => clearTimeout(t);
  }, []);

  // Random talking
  useEffect(() => {
    const t = setInterval(() => {
      setTalking(true);
      setTimeout(() => setTalking(false), 800 + Math.random() * 800);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={containerRef} className={`rb3d ${hover ? "rb3d--hover" : ""}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>

      {/* Platform glow */}
      <div className="rb3d__platform" />

      {/* Float wrapper */}
      <div className="rb3d__float">

        {/* Antenna */}
        <div className="rb3d__ant">
          <div className="rb3d__ant-ball" />
        </div>

        {/* Head */}
        <div className="rb3d__head">
          {/* Ear left */}
          <div className="rb3d__ear rb3d__ear--l" />
          {/* Ear right */}
          <div className="rb3d__ear rb3d__ear--r" />
          {/* Face */}
          <div className="rb3d__face">
            {/* Eye L */}
            <div className="rb3d__eye-wrap">
              <div className="rb3d__eye">
                <div className="rb3d__pupil" style={{
                  transform: blink
                    ? "scaleY(0.05)"
                    : `translate(${pupils.x}px, ${pupils.y}px)`,
                }}>
                  <div className="rb3d__iris" />
                  <div className="rb3d__shine" />
                </div>
              </div>
            </div>
            {/* Eye R */}
            <div className="rb3d__eye-wrap">
              <div className="rb3d__eye">
                <div className="rb3d__pupil" style={{
                  transform: blink
                    ? "scaleY(0.05)"
                    : `translate(${pupils.x}px, ${pupils.y}px)`,
                }}>
                  <div className="rb3d__iris" />
                  <div className="rb3d__shine" />
                </div>
              </div>
            </div>
          </div>
          {/* Mouth */}
          <div className={`rb3d__mouth ${talking ? "rb3d__mouth--talk" : ""}`} />
          {/* Cheeks */}
          <div className="rb3d__cheek rb3d__cheek--l" />
          <div className="rb3d__cheek rb3d__cheek--r" />
        </div>

        {/* Body */}
        <div className="rb3d__body">
          {/* Neck */}
          <div className="rb3d__neck" />
          {/* Torso */}
          <div className="rb3d__torso">
            <div className="rb3d__badge">S</div>
            <div className="rb3d__chest-light" />
          </div>
          {/* Arms */}
          <div className="rb3d__arm rb3d__arm--l" />
          <div className="rb3d__arm rb3d__arm--r" />
          {/* Base */}
          <div className="rb3d__base" />
        </div>

      </div>
    </div>
  );
}

/* ── Composant principal ──────────────────────────────────────────────────── */
export default function AIAssistant() {
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [advanced,   setAdvanced]   = useState(false);
  const chatRef = useRef(null);
  const firstName = user?.name?.split(" ")[0] || "Étudiant";

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(txt) {
    const content = (txt || input).trim();
    if (!content || loading) return;
    setInput("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const { data } = await aiService.chat(next.map(m => ({ role: m.role, content: m.content })));
      setMessages([...next, { role: "assistant", content: data.result?.text || "..." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "❌ Erreur de connexion. Réessayez." }]);
    } finally { setLoading(false); }
  }

  const ACTIONS = [
    { ico: <FiSearch size={18}/>,    label: "Rechercher des stages",       desc: "Trouvez des stages qui correspondent à votre profil et vos compétences",  prompt: "Recommande-moi des stages adaptés à mon profil" },
    { ico: <FiFileText size={18}/>,  label: "Améliorer mon CV",            desc: "Obtenez des conseils pour optimiser votre CV et le rendre plus attractif", prompt: "Comment améliorer mon CV pour décrocher un stage ?" },
    { ico: <FiStar size={18}/>,      label: "Préparer un entretien",       desc: "Entraînez-vous et obtenez des conseils pour réussir vos entretiens",       prompt: "Aide-moi à préparer mon entretien de stage" },
    { ico: <FiTrendingUp size={18}/>,label: "Conseils carrière",           desc: "Obtenez des conseils personnalisés pour votre parcours professionnel",     prompt: "Donne-moi des conseils pour ma carrière" },
    { ico: <FiZap size={18}/>,       label: "Compétences à développer",    desc: "Découvrez les compétences les plus demandées dans votre domaine",          prompt: "Quelles compétences dois-je développer ?" },
    { ico: <FiBarChart2 size={18}/>, label: "Analyse de profil",           desc: "Analysez votre profil et recevez des recommandations personnalisées",      prompt: "Analyse mon profil et donne-moi des recommandations" },
  ];

  const ACTIVITY = [
    { ico: <FiSearch size={14}/>,    label: "Recherche de stages",      time: "Il y a 2 heures",  color: "#4F46E5" },
    { ico: <FiFileText size={14}/>,  label: "Analyse de CV",            time: "Il y a 1 jour",    color: "#8B5CF6" },
    { ico: <FiStar size={14}/>,      label: "Conseils entretien",       time: "Il y a 2 jours",   color: "#EC4899" },
    { ico: <FiZap size={14}/>,       label: "Développement compétences",time: "Il y a 3 jours",   color: "#F59E0B" },
  ];

  return (
    <DashboardLayout title="AI Assistant" subtitle="Votre assistant intelligent pour réussir votre carrière">
      <div className="ai-page">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="ai-page-hdr">
          <div className="ai-page-hdr__left">
            <span className="ai-page-hdr__ico">✦</span>
            <div>
              <h1 className="ai-page-hdr__title">AI Assistant</h1>
              <p className="ai-page-hdr__sub">Votre assistant intelligent pour réussir votre carrière</p>
            </div>
          </div>
          <button className="ai-hist-btn">
            <FiClock size={15}/> Historique des conversations
          </button>
        </div>

        {/* ── Layout principal ───────────────────────────────────────────── */}
        <div className="ai-layout">

          {/* ══ Colonne gauche ══ */}
          <div className="ai-left">

            {/* Hero card */}
            <div className="ai-hero">
              {/* Texte */}
              <div className="ai-hero__text">
                <h2 className="ai-hero__title">
                  Bonjour <span className="ai-hero__name">{firstName}</span> !
                </h2>
                <p className="ai-hero__p">Je suis votre assistant IA personnel.</p>
                <p className="ai-hero__p">Comment puis-je vous aider aujourd'hui ?</p>
                <div className="ai-hero__badge">
                  <span className="ai-hero__dot" />
                  En ligne &nbsp;·&nbsp; Toujours prêt à vous aider
                </div>
              </div>

              {/* Robot */}
              <div className="ai-hero__robot">
                <Robot3D />
              </div>

              {/* Orbe décoratif */}
              <div className="ai-hero__orb" />
            </div>

            {/* Titre actions */}
            <p className="ai-actions-label">Vous pouvez me demander de :</p>

            {/* 6 cards actions */}
            <div className="ai-actions-grid">
              {ACTIONS.map((a, i) => (
                <button key={i} className="ai-action-card" onClick={() => sendMessage(a.prompt)}>
                  <div className="ai-action-card__ico">{a.ico}</div>
                  <div className="ai-action-card__label">{a.label}</div>
                  <div className="ai-action-card__desc">{a.desc}</div>
                </button>
              ))}
            </div>

            {/* Zone chat */}
            {messages.length > 0 && (
              <div className="ai-chat-box" ref={chatRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`ai-chat-msg ai-chat-msg--${m.role}`}>
                    {m.role === "assistant" && (
                      <div className="ai-chat-msg__av">✦</div>
                    )}
                    <div className="ai-chat-msg__bubble">
                      {m.content.split("\n").map((l, j) => <p key={j}>{l}</p>)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="ai-chat-msg ai-chat-msg--assistant">
                    <div className="ai-chat-msg__av">✦</div>
                    <div className="ai-chat-msg__bubble ai-chat-msg__bubble--typing">
                      <span/><span/><span/>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="ai-input-wrap">
              <div className="ai-input-box">
                <textarea
                  className="ai-input-ta"
                  placeholder="Posez-moi votre question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  rows={1}
                />
                <div className="ai-input-actions">
                  <button className="ai-input-btn ai-input-btn--ghost" title="Joindre un fichier"><FiPlus size={17}/></button>
                  <button className="ai-input-btn ai-input-btn--ghost" title="Microphone"><FiMic size={17}/></button>
                  <button className="ai-input-btn ai-input-btn--send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                    <FiSend size={16}/>
                  </button>
                </div>
              </div>
              <p className="ai-input-notice"><FiShield size={11}/> Vos données sont sécurisées et confidentielles</p>
            </div>

          </div>

          {/* ══ Colonne droite ══ */}
          <aside className="ai-right">

            {/* Conseils du jour */}
            <div className="ai-sidebar-card">
              <div className="ai-sidebar-card__hdr">
                <span className="ai-sidebar-card__title">Conseils du jour</span>
                <span style={{fontSize:"1.1rem"}}>✨</span>
              </div>
              <div className="ai-quote">
                <div className="ai-quote__mark ai-quote__mark--open">"</div>
                <p className="ai-quote__text">
                  "La préparation d'aujourd'hui détermine le succès de demain. Continuez à apprendre et à grandir !"
                </p>
                <div className="ai-quote__mark ai-quote__mark--close">"</div>
                <p className="ai-quote__author">− Votre AI Assistant</p>
              </div>
            </div>

            {/* Activité récente */}
            <div className="ai-sidebar-card">
              <div className="ai-sidebar-card__hdr">
                <span className="ai-sidebar-card__title">Activité récente</span>
              </div>
              <div className="ai-activity">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="ai-activity-item">
                    <div className="ai-activity-ico" style={{ background: a.color + "18", color: a.color }}>
                      {a.ico}
                    </div>
                    <div>
                      <div className="ai-activity-label">{a.label}</div>
                      <div className="ai-activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="ai-activity-more">
                Voir tout l'historique <FiChevronRight size={13}/>
              </button>
            </div>

            {/* Mode IA Avancé */}
            <div className={`ai-sidebar-card ai-advanced-card ${advanced ? "ai-advanced-card--on" : ""}`}>
              <div className="ai-advanced-ico">✦</div>
              <h3 className="ai-advanced-title">Mode IA Avancé</h3>
              <p className="ai-advanced-desc">
                Activez le mode avancé pour des réponses plus détaillées et personnalisées.
              </p>
              <button className="ai-advanced-btn" onClick={() => setAdvanced(v => !v)}>
                ✦ {advanced ? "Mode avancé actif" : "Activer le mode avancé"}
              </button>
            </div>

          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}