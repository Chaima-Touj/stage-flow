import { Link } from "react-router-dom";
import {
  FiArrowRight, FiPlay, FiUsers, FiBriefcase,
  FiTrendingUp, FiShield, FiStar, FiCheck,
  FiGlobe, FiBell, FiBarChart2, FiMessageSquare, FiFileText
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import "./LandingPage.css";

const translations = {
  fr: {
    nav: ["Accueil", "Fonctionnalités", "À propos", "Comment ça marche", "Tarifs", "Contact"],
    login: "Se connecter", register: "S'inscrire",
    hero_badge: "La plateforme #1 de gestion de stages",
    hero_title: "Gérez vos stages simplement et",
    hero_highlight: "efficacement",
    hero_desc: "StageFlow connecte étudiants, entreprises et encadrants dans un environnement collaboratif pour simplifier la gestion des stages de A à Z.",
    hero_cta1: "Commencer gratuitement", hero_cta2: "Voir la démo",
    hero_f1: "Gratuit pour commencer", hero_f2: "Simple et intuitif", hero_f3: "Sécurisé et fiable",
    roles_badge: "POUR TOUS LES ACTEURS",
    roles_title: "Une solution adaptée à chaque rôle",
    roles_discover: "Découvrir",
    stats: ["Étudiants inscrits", "Entreprises partenaires", "Offres de stage", "Candidatures envoyées"],
    features_title: "Tout ce dont vous avez besoin",
    features_desc: "Une plateforme complète pour gérer vos stages de A à Z",
    cta_title: "Prêt à commencer ?",
    cta_desc: "Rejoignez des milliers d'étudiants et d'entreprises qui font confiance à StageFlow.",
    cta_btn: "Créer un compte gratuit",
    footer: "Tous droits réservés",
    preview_stats: [
      { label: "Candidatures", value: "24", color: "#2563EB" },
      { label: "En attente",   value: "8",  color: "#F59E0B" },
      { label: "Acceptées",    value: "5",  color: "#10B981" },
      { label: "Refusées",     value: "3",  color: "#EF4444" },
    ],
    preview_notifs: ["✅ Candidature acceptée", "📩 Nouveau message", "📅 Entretien programmé"],
  },
  en: {
    nav: ["Home", "Features", "About", "How it works", "Pricing", "Contact"],
    login: "Sign in", register: "Sign up",
    hero_badge: "The #1 internship management platform",
    hero_title: "Manage your internships simply and",
    hero_highlight: "efficiently",
    hero_desc: "StageFlow connects students, companies and supervisors in a collaborative environment to simplify internship management from A to Z.",
    hero_cta1: "Get started free", hero_cta2: "Watch demo",
    hero_f1: "Free to start", hero_f2: "Simple & intuitive", hero_f3: "Secure & reliable",
    roles_badge: "FOR ALL USERS",
    roles_title: "A solution for every role",
    roles_discover: "Discover",
    stats: ["Students enrolled", "Partner companies", "Internship offers", "Applications sent"],
    features_title: "Everything you need",
    features_desc: "A complete platform to manage your internships from A to Z",
    cta_title: "Ready to get started?",
    cta_desc: "Join thousands of students and companies who trust StageFlow.",
    cta_btn: "Create a free account",
    footer: "All rights reserved",
    preview_stats: [
      { label: "Applications", value: "24", color: "#2563EB" },
      { label: "Pending",      value: "8",  color: "#F59E0B" },
      { label: "Accepted",     value: "5",  color: "#10B981" },
      { label: "Rejected",     value: "3",  color: "#EF4444" },
    ],
    preview_notifs: ["✅ Application accepted", "📩 New message", "📅 Interview scheduled"],
  },
  ar: {
    nav: ["الرئيسية", "المميزات", "حول", "كيف يعمل", "الأسعار", "اتصل بنا"],
    login: "تسجيل الدخول", register: "إنشاء حساب",
    hero_badge: "منصة إدارة التدريب الرائدة",
    hero_title: "أدر تدريبك بسهولة و",
    hero_highlight: "فعالية",
    hero_desc: "StageFlow يربط الطلاب والشركات والمشرفين في بيئة تعاونية لتبسيط إدارة التدريب من الألف إلى الياء.",
    hero_cta1: "ابدأ مجاناً", hero_cta2: "شاهد العرض",
    hero_f1: "مجاني للبدء", hero_f2: "بسيط وسهل", hero_f3: "آمن وموثوق",
    roles_badge: "لجميع المستخدمين",
    roles_title: "حل مناسب لكل دور",
    roles_discover: "اكتشف",
    stats: ["طالب مسجل", "شركة شريكة", "عرض تدريب", "طلب مرسل"],
    features_title: "كل ما تحتاجه",
    features_desc: "منصة متكاملة لإدارة تدريبك من الألف إلى الياء",
    cta_title: "هل أنت مستعد للبدء؟",
    cta_desc: "انضم إلى آلاف الطلاب والشركات الذين يثقون في StageFlow.",
    cta_btn: "إنشاء حساب مجاني",
    footer: "جميع الحقوق محفوظة",
    preview_stats: [
      { label: "الطلبات",    value: "24", color: "#2563EB" },
      { label: "قيد الانتظار", value: "8", color: "#F59E0B" },
      { label: "مقبولة",    value: "5",  color: "#10B981" },
      { label: "مرفوضة",    value: "3",  color: "#EF4444" },
    ],
    preview_notifs: ["✅ تم قبول الطلب", "📩 رسالة جديدة", "📅 مقابلة مجدولة"],
  }
};

const roles = [
  { icon: "🎓", title: { fr: "Étudiants",      en: "Students",   ar: "الطلاب"    }, color: "#2563EB",
    desc: { fr: "Trouvez le stage idéal, postulez facilement et suivez vos candidatures.", en: "Find your ideal internship, apply easily and track your applications.", ar: "ابحث عن التدريب المثالي وتابع طلباتك." } },
  { icon: "🏢", title: { fr: "Entreprises",     en: "Companies",  ar: "الشركات"   }, color: "#10B981",
    desc: { fr: "Publiez vos offres, gérez les candidatures et trouvez les meilleurs talents.", en: "Post your offers, manage applications and find the best talents.", ar: "انشر عروضك وابحث عن أفضل المواهب." } },
  { icon: "👨‍🏫", title: { fr: "Encadrants",    en: "Supervisors", ar: "المشرفون" }, color: "#F59E0B",
    desc: { fr: "Suivez et évaluez les étudiants, supervisez les stages efficacement.", en: "Track and evaluate students, supervise internships efficiently.", ar: "تابع الطلاب وأشرف على التدريب." } },
  { icon: "⚡", title: { fr: "Administrateurs", en: "Admins",     ar: "المديرون"  }, color: "#8B5CF6",
    desc: { fr: "Gérez la plateforme, les utilisateurs et les statistiques globales.", en: "Manage the platform, users and global statistics.", ar: "أدر المنصة والمستخدمين والإحصائيات." } },
];

const features = [
  { icon: <FiGlobe size={24}/>,        title: { fr: "Multi-langue",     en: "Multi-language", ar: "متعدد اللغات"           }, desc: { fr: "FR / AR / EN",             en: "FR / AR / EN",         ar: "FR / AR / EN"              }, color: "#2563EB" },
  { icon: <FiBell size={24}/>,         title: { fr: "Notifications",    en: "Notifications",  ar: "الإشعارات"              }, desc: { fr: "En temps réel",            en: "Real-time",            ar: "في الوقت الحقيقي"          }, color: "#10B981" },
  { icon: <FiBarChart2 size={24}/>,    title: { fr: "Tableaux de bord", en: "Dashboards",     ar: "لوحات التحكم"           }, desc: { fr: "Statistiques avancées",    en: "Advanced statistics",  ar: "إحصائيات متقدمة"           }, color: "#F59E0B" },
  { icon: <FiMessageSquare size={24}/>,title: { fr: "Assistant IA",     en: "AI Assistant",   ar: "مساعد ذكاء اصطناعي"    }, desc: { fr: "Powered by Groq AI",       en: "Powered by Groq AI",   ar: "مدعوم بـ Groq AI"          }, color: "#8B5CF6" },
  { icon: <FiShield size={24}/>,       title: { fr: "Sécurité",         en: "Security",       ar: "الأمان"                 }, desc: { fr: "Données protégées",        en: "Protected data",       ar: "بيانات محمية"              }, color: "#EF4444" },
  { icon: <FiUsers size={24}/>,        title: { fr: "Multi-rôle",       en: "Multi-role",     ar: "متعدد الأدوار"          }, desc: { fr: "4 rôles distincts",        en: "4 distinct roles",     ar: "4 أدوار مختلفة"            }, color: "#06B6D4" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang }   = useLang();
  const t = translations[lang] || translations.fr;

  // Met à jour l'attribut lang du document pour les lecteurs d'écran
  document.documentElement.lang = lang;

  return (
    <div className="landing">
      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">S</span>
            <span>StageFlow</span>
          </Link>

          <ul className="nav-links">
            {t.nav.map((item) => (
              <li key={item}><a href="#features" className="nav-link">{item}</a></li>
            ))}
          </ul>

          <div className="nav-actions">
            <div className="lang-selector">
              {["fr","en","ar"].map((l) => (
                <button key={l} onClick={() => changeLang(l)}
                  className={`lang-btn ${lang === l ? "active" : ""}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button onClick={toggleTheme} className="theme-btn" aria-label="toggle theme">
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <Link to="/login"    className="btn btn-ghost">{t.login}</Link>
            <Link to="/register" className="btn btn-primary">{t.register}</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content fade-in">
            <div className="hero-badge">
              <FiStar size={14}/> {t.hero_badge}
            </div>
            <h1 className="hero-title">
              {t.hero_title}<br/>
              <span className="hero-highlight">{t.hero_highlight}</span>
            </h1>
            <p className="hero-desc">{t.hero_desc}</p>
            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary btn-lg">
                {t.hero_cta1} <FiArrowRight/>
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                <FiPlay size={16}/> {t.hero_cta2}
              </Link>
            </div>
            <div className="hero-features">
              {[t.hero_f1, t.hero_f2, t.hero_f3].map((f) => (
                <span key={f} className="hero-feature">
                  <FiCheck size={14} color="#10B981"/> {f}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-visual fade-in">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots"><span/><span/><span/></div>
                <span className="preview-title">StageFlow Dashboard</span>
              </div>
              <div className="preview-body">
                <div className="preview-stats">
                  {t.preview_stats.map((s) => (
                    <div key={s.label} className="preview-stat">
                      <span className="preview-stat-value" style={{ color: s.color }}>{s.value}</span>
                      <span className="preview-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="preview-bars">
                  {[80, 60, 45, 30, 20].map((h, i) => (
                    <div key={i} className="preview-bar" style={{ height: `${h}%`, background: "#2563EB", opacity: 0.7 + i * 0.06 }}/>
                  ))}
                </div>
                <div className="preview-notifications">
                  {t.preview_notifs.map((n) => (
                    <div key={n} className="preview-notif">{n}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────────────── */}
      <section className="stats-section">
        {[
          { value: "1,248+", label: t.stats[0], icon: <FiUsers/> },
          { value: "320+",   label: t.stats[1], icon: <FiBriefcase/> },
          { value: "2,156+", label: t.stats[2], icon: <FiTrendingUp/> },
          { value: "8,742+", label: t.stats[3], icon: <FiFileText/> },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ─── Rôles ──────────────────────────────────────────────────────── */}
      <section id="features" className="roles-section">
        <div className="section-header">
          <span className="section-badge">{t.roles_badge}</span>
          <h2 className="section-title">{t.roles_title}</h2>
        </div>
        <div className="roles-grid">
          {roles.map((r) => (
            <div key={r.title.fr} className="role-card">
              <div className="role-icon" style={{ background: r.color + "20" }}>
                <span style={{ fontSize: "2rem" }}>{r.icon}</span>
              </div>
              <h3 className="role-title" style={{ color: r.color }}>{r.title[lang]}</h3>
              <p className="role-desc">{r.desc[lang]}</p>
              <Link to="/register" className="role-link" style={{ color: r.color }}>
                {t.roles_discover} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────── */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">{t.features_title}</h2>
          <p className="section-desc">{t.features_desc}</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title.fr} className="feature-card">
              <div className="feature-icon" style={{ background: f.color + "20", color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title[lang]}</h3>
              <p className="feature-desc">{f.desc[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Final ──────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">{t.cta_title}</h2>
          <p className="cta-desc">{t.cta_desc}</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            {t.cta_btn} <FiArrowRight/>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <span>© 2026 StageFlow. {t.footer}.</span>
      </footer>
    </div>
  );
}
