import { Link } from "react-router-dom";
import { useState } from "react";
import {
  // eslint-disable-next-line no-unused-vars
  FiArrowRight, FiUsers, FiBriefcase, FiTrendingUp,
  FiGlobe, FiBell, FiBarChart2, FiMessageSquare,
  FiShield, FiMapPin, FiPhone, FiMail, FiSend,
  FiMoon, FiSun, FiFacebook, FiLinkedin, FiInstagram, FiTwitter
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import "./LandingPage.css";

/* ─── Données statiques ──────────────────────────────────────────────────── */
const testimonials = [
  { name: "Yassine M.",   role: { fr: "Étudiant en Génie Logiciel",   en: "Software Engineering Student", ar: "طالب هندسة برمجيات"        }, text: { fr: "Grâce à StageFlow, j'ai trouvé un stage rapidement et suivi mes tâches sans stress.",                                en: "Thanks to StageFlow, I found an internship quickly and tracked my tasks stress-free.",               ar: "بفضل StageFlow وجدت تدريبي بسرعة وتابعت مهامي بدون توتر."                    }, stars: 5, photo: "https://i.pravatar.cc/80?img=11" },
  { name: "Mme. Ben Ali", role: { fr: "Encadrante pédagogique",        en: "Academic Supervisor",          ar: "مشرفة أكاديمية"             }, text: { fr: "Une plateforme complète qui nous fait gagner un temps précieux dans le suivi des stagiaires.",                         en: "A complete platform that saves us precious time in tracking interns.",                                ar: "منصة متكاملة توفر لنا وقتاً ثميناً في متابعة المتدربين."                     }, stars: 5, photo: "https://i.pravatar.cc/80?img=47" },
  { name: "Anis K.",      role: { fr: "Responsable RH, TechSolutions", en: "HR Manager, TechSolutions",    ar: "مدير موارد بشرية"           }, text: { fr: "Nous utilisons StageFlow pour gérer tous nos stagiaires, c'est simple, efficace et professionnel.",                   en: "We use StageFlow to manage all our interns, it's simple, efficient and professional.",               ar: "نستخدم StageFlow لإدارة جميع متدربينا، بسيط وفعال واحترافي."                }, stars: 5, photo: "https://i.pravatar.cc/80?img=12" },
  { name: "Salma R.",     role: { fr: "Étudiante en Informatique",      en: "Computer Science Student",     ar: "طالبة علوم حاسوب"           }, text: { fr: "Interface intuitive et support réactif. Je recommande vivement !",                                                   en: "Intuitive interface and responsive support. Highly recommend!",                                      ar: "واجهة سهلة الاستخدام ودعم سريع الاستجابة. أوصي به بشدة!"                    }, stars: 5, photo: "https://i.pravatar.cc/80?img=45" },
  { name: "Dr. Karim",    role: { fr: "Enseignant universitaire",       en: "University Professor",         ar: "أستاذ جامعي"                }, text: { fr: "Les rapports et tableaux de bord nous aident à mieux évaluer et accompagner les étudiants.",                          en: "Reports and dashboards help us better evaluate and support students.",                                ar: "التقارير ولوحات التحكم تساعدنا على تقييم الطلاب ومتابعتهم بشكل أفضل."      }, stars: 5, photo: "https://i.pravatar.cc/80?img=15" },
  { name: "Mehdi T.",     role: { fr: "CEO, Innovatech",                en: "CEO, Innovatech",              ar: "المدير التنفيذي، Innovatech" }, text: { fr: "StageFlow simplifie tout le processus de A à Z. Une vraie révolution !",                                           en: "StageFlow simplifies the entire process from A to Z. A real revolution!",                            ar: "StageFlow يبسط كل العملية من الألف إلى الياء. ثورة حقيقية!"                 }, stars: 5, photo: "https://i.pravatar.cc/80?img=18" },
];

const features = [
  { icon: <FiGlobe size={22}/>,         color: "#2563EB", title: { fr: "Multi-langue",     en: "Multi-language", ar: "متعدد اللغات"  }, desc: { fr: "Français, Anglais et Arabe",            en: "French, English and Arabic",              ar: "فرنسي، إنجليزي وعربي"           } },
  { icon: <FiBell size={22}/>,          color: "#10B981", title: { fr: "Notifications",    en: "Notifications",  ar: "الإشعارات"     }, desc: { fr: "Alertes en temps réel",                 en: "Real-time alerts",                        ar: "تنبيهات فورية"                  } },
  { icon: <FiBarChart2 size={22}/>,     color: "#F59E0B", title: { fr: "Tableaux de bord", en: "Dashboards",     ar: "لوحات التحكم"  }, desc: { fr: "Statistiques avancées",                 en: "Advanced statistics",                     ar: "إحصائيات متقدمة"                } },
  { icon: <FiMessageSquare size={22}/>, color: "#8B5CF6", title: { fr: "Assistant IA",     en: "AI Assistant",   ar: "مساعد ذكاء"    }, desc: { fr: "Powered by Groq / LLaMA",               en: "Powered by Groq / LLaMA",                 ar: "مدعوم بـ Groq / LLaMA"          } },
  { icon: <FiShield size={22}/>,        color: "#EF4444", title: { fr: "Sécurité",         en: "Security",       ar: "الأمان"         }, desc: { fr: "Données chiffrées & protégées",          en: "Encrypted & protected data",              ar: "بيانات مشفرة ومحمية"            } },
  { icon: <FiUsers size={22}/>,         color: "#06B6D4", title: { fr: "Multi-rôle",       en: "Multi-role",     ar: "متعدد الأدوار" }, desc: { fr: "4 profils : étudiant, entreprise, encadrant, admin", en: "4 profiles: student, company, supervisor, admin", ar: "4 أدوار مختلفة"   } },
];

const NAV_ITEMS = {
  fr: ["Accueil", "Fonctionnalités", "Tarifs", "À propos", "Témoignages", "Contact"],
  en: ["Home", "Features", "Pricing", "About", "Testimonials", "Contact"],
  ar: ["الرئيسية", "المميزات", "الأسعار", "حول", "آراء", "اتصل"],
};
const NAV_ANCHORS = ["#hero", "#features", "#pricing", "#about", "#testimonials", "#contact"];
const FLAG = { fr: "🇫🇷 Fr", en: "🇬🇧 En", ar: "🇹🇳 Ar" };

/* ─── Composant principal ────────────────────────────────────────────────── */
export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang }   = useLang();
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [sent, setSent]           = useState(false);
  const [newsletter, setNewsletter] = useState("");

  // eslint-disable-next-line react-hooks/immutability
  document.documentElement.lang = lang;

  const handleContact = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const T = (fr, en, ar) => (lang === "ar" ? ar : lang === "en" ? en : fr);

  return (
    <div className="landing">

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav__inner">
          <Link to="/" className="lp-nav__logo">
            <span className="lp-nav__logo-icon">S</span>
            <span>Stage<span className="lp-accent">Flow</span></span>
          </Link>

          <ul className="lp-nav__links">
            {NAV_ITEMS[lang].map((item, i) => (
              <li key={item}><a href={NAV_ANCHORS[i]} className="lp-nav__link">{item}</a></li>
            ))}
          </ul>

          <div className="lp-nav__actions">
            {/* Sélecteur langue */}
            <div className="lp-lang">
              <span className="lp-lang__current">{FLAG[lang]} ▾</span>
              <div className="lp-lang__dropdown">
                {["fr","en","ar"].map(l => (
                  <button key={l} onClick={() => changeLang(l)} className={`lp-lang__opt ${lang===l?"active":""}`}>
                    {FLAG[l]}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={toggleTheme} className="lp-theme-btn" aria-label="toggle theme">
              {theme === "light" ? <FiMoon size={16}/> : <FiSun size={16}/>}
            </button>

            <Link to="/login"    className="btn btn-ghost   lp-btn-sm">{T("Se connecter","Sign in","تسجيل الدخول")}</Link>
            <Link to="/register" className="btn btn-primary lp-btn-sm">{T("S'inscrire","Sign up","إنشاء حساب")}</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="lp-hero">
        <div className="lp-hero__inner">

          {/* Texte */}
          <div className="lp-hero__content">
            <span className="lp-badge">
              🚀 {T("Plateforme de gestion des stages","Internship Management Platform","منصة إدارة التدريب")}
            </span>
            <h1 className="lp-hero__title">
              {T(
                <><span>Gérez vos stages simplement.</span><br/><span className="lp-accent">Performez demain.</span></>,
                <><span>Manage internships simply.</span><br/><span className="lp-accent">Perform tomorrow.</span></>,
                <><span>أدر تدريبك بسهولة.</span><br/><span className="lp-accent">حقق النجاح غداً.</span></>
              )}
            </h1>
            <p className="lp-hero__desc">
              {T(
                "StageFlow est la solution tout-en-un pour les étudiants, les encadrants et les entreprises. Suivez, gérez et réussissez vos stages facilement.",
                "StageFlow is the all-in-one solution for students, supervisors and companies. Track, manage and succeed in your internships effortlessly.",
                "StageFlow هو الحل الشامل للطلاب والمشرفين والشركات. تابع وأدر واحصل على النجاح في تدريبك بسهولة."
              )}
            </p>
            <div className="lp-hero__ctas">
              <Link to="/register" className="btn btn-primary btn-lg">
                {T("Commencer gratuitement","Get started free","ابدأ مجاناً")} <FiArrowRight/>
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                ▶ {T("Découvrir la plateforme","Discover platform","اكتشف المنصة")}
              </Link>
            </div>
            <div className="lp-hero__badges">
              {T(
                ["✅ Facile à utiliser","🔒 Sécurisé","🌍 Accessible partout"],
                ["✅ Easy to use","🔒 Secure","🌍 Accessible anywhere"],
                ["✅ سهل الاستخدام","🔒 آمن","🌍 متاح في كل مكان"]
              ).map(b => <span key={b} className="lp-hero__badge-item">{b}</span>)}
            </div>
          </div>

          {/* Illustration */}
          <div className="lp-hero__visual">
            <div className="lp-hero__illustration">
              <div className="lp-hero__avatar-wrap">
                <img src="/hero-girl.png" alt="StageFlow hero" className="lp-hero__img" />
              </div>
              <div className="lp-float lp-float--tl">
                <span className="lp-float__icon">💼</span>
                <div>
                  <div className="lp-float__label">{T("Mes stages","My internships","تدريباتي")}</div>
                  <div className="lp-float__val">2 {T("en cours","ongoing","جارية")}</div>
                </div>
              </div>
              <div className="lp-float lp-float--tr">
                <span className="lp-float__icon">📊</span>
                <div>
                  <div className="lp-float__label">{T("Rapports","Reports","تقارير")}</div>
                  <div className="lp-float__val">3 {T("à valider","to review","للمراجعة")}</div>
                </div>
              </div>
              <div className="lp-float lp-float--bl">
                <span className="lp-float__icon">✅</span>
                <div>
                  <div className="lp-float__label">{T("Tâches","Tasks","مهام")}</div>
                  <div className="lp-float__val">5 {T("à faire","to do","للإنجاز")}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="lp-stats">
        <div className="lp-stats__inner">
          {[
            { icon: "🎓", val: "500+",  label: T("Étudiants actifs","Active students","طالب نشط")          },
            { icon: "🏢", val: "120+",  label: T("Entreprises partenaires","Partner companies","شركة شريكة") },
            { icon: "⭐", val: "98%",   label: T("Taux de satisfaction","Satisfaction rate","معدل الرضا")   },
            { icon: "⚡", val: "1000+", label: T("Stages gérés avec succès","Internships managed","تدريب ناجح") },
          ].map(s => (
            <div key={s.val} className="lp-stat">
              <span className="lp-stat__icon">{s.icon}</span>
              <span className="lp-stat__val">{s.val}</span>
              <span className="lp-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="lp-features">
        <div className="lp-section-header">
          <h2 className="lp-section-title">{T("Tout ce dont vous avez besoin","Everything you need","كل ما تحتاجه")}</h2>
          <p className="lp-section-sub">{T("Une plateforme complète pour gérer vos stages de A à Z","A complete platform to manage your internships from A to Z","منصة متكاملة لإدارة تدريبك")}</p>
        </div>
        <div className="lp-features__grid">
          {features.map(f => (
            <div key={f.title.fr} className="lp-feature-card">
              <div className="lp-feature-card__icon" style={{ background: f.color+"18", color: f.color }}>{f.icon}</div>
              <h3 className="lp-feature-card__title">{f.title[lang]}</h3>
              <p className="lp-feature-card__desc">{f.desc[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      <section id="testimonials" className="lp-testimonials">
        <div className="lp-section-header">
          <h2 className="lp-section-title">
            {T(<>Ils ont choisi <span className="lp-accent">StageFlow</span></>,<>They chose <span className="lp-accent">StageFlow</span></>,<>اختاروا <span className="lp-accent">StageFlow</span></>)}
          </h2>
          <p className="lp-section-sub">{T("Découvrez ce que nos utilisateurs disent de leur expérience","Discover what our users say about their experience","اكتشف ما يقوله مستخدمونا عن تجربتهم")}</p>
        </div>
        <div className="lp-testimonials__grid">
          {testimonials.map(t => (
            <div key={t.name} className="lp-testi-card">
              <div className="lp-testi-card__quote">"</div>
              <p className="lp-testi-card__text">{t.text[lang]}</p>
              <div className="lp-testi-card__stars">{"★".repeat(t.stars)}</div>
              <div className="lp-testi-card__author">
                <img src={t.photo} alt={t.name} className="lp-testi-card__avatar-img" />
                <div>
                  <div className="lp-testi-card__name">{t.name}</div>
                  <div className="lp-testi-card__role">{t.role[lang]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="lp-contact">
        <div className="lp-contact__inner">
          <div className="lp-contact__form-wrap">
            <h2 className="lp-contact__title">{T("Contactez-nous ✉️","Contact us ✉️","اتصل بنا ✉️")}</h2>
            {sent && (
              <div className="lp-contact__success">
                ✅ {T("Message envoyé avec succès !","Message sent successfully!","تم إرسال رسالتك بنجاح!")}
              </div>
            )}
            <form className="lp-contact__form" onSubmit={handleContact}>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">👤</span>
                <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="lp-input" placeholder={T("Votre nom","Your name","اسمك")}/>
              </div>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">✉️</span>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="lp-input" placeholder={T("Votre email","Your email","بريدك الإلكتروني")}/>
              </div>
              <div className="lp-input-wrap lp-input-wrap--textarea">
                <span className="lp-input-icon lp-input-icon--top">✏️</span>
                <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))}
                  className="lp-input lp-textarea" placeholder={T("Votre message...","Your message...","رسالتك...")}/>
              </div>
              <button type="submit" className="btn btn-primary lp-contact__submit">
                {T("Envoyer le message","Send message","إرسال الرسالة")} <FiSend size={16}/>
              </button>
            </form>
          </div>

          <div className="lp-contact__info-wrap">
            <div className="lp-contact__info-card lp-contact__info-card--full">
              <div className="lp-contact__brand">
                <span className="lp-nav__logo-icon" style={{width:38,height:38,fontSize:"1rem"}}>S</span>
                <span className="lp-contact__brand-name">Stage<span className="lp-accent">Flow</span></span>
              </div>
              <p className="lp-contact__info-desc">
                {T(
                  "Nous sommes disponibles pour répondre à toutes vos questions. N'hésitez pas à nous contacter.",
                  "We are available to answer all your questions. Feel free to contact us.",
                  "نحن متاحون للإجابة على جميع أسئلتكم. لا تترددوا في التواصل معنا."
                )}
              </p>
              <div className="lp-contact__info-list">
                <div className="lp-contact__info-item">
                  <div className="lp-contact__info-icon"><FiMapPin size={16}/></div>
                  <div>
                    <div className="lp-contact__info-label">{T("Adresse","Address","العنوان")}</div>
                    <div className="lp-contact__info-val">Ariana, Tunis, Tunisie</div>
                  </div>
                </div>
                <div className="lp-contact__info-item">
                  <div className="lp-contact__info-icon"><FiPhone size={16}/></div>
                  <div>
                    <div className="lp-contact__info-label">{T("Téléphone","Phone","الهاتف")}</div>
                    <div className="lp-contact__info-val">+216 98 765 432</div>
                  </div>
                </div>
                <div className="lp-contact__info-item">
                  <div className="lp-contact__info-icon"><FiMail size={16}/></div>
                  <div>
                    <div className="lp-contact__info-label">Email</div>
                    <div className="lp-contact__info-val">contact@stageflow.tn</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section className="lp-newsletter">
        <div className="lp-newsletter__inner">
          <div>
            <div className="lp-newsletter__icon">✈️</div>
            <h3 className="lp-newsletter__title">{T("Restez informé des nouveautés","Stay informed about updates","ابقَ على اطلاع بآخر الأخبار")}</h3>
            <p className="lp-newsletter__sub">{T("Inscrivez-vous à notre newsletter et ne manquez rien !","Subscribe to our newsletter and miss nothing","اشترك في نشرتنا ولا تفوّت أي جديد")}</p>
          </div>
          <div className="lp-newsletter__form">
            <input value={newsletter} onChange={e => setNewsletter(e.target.value)}
              className="lp-newsletter__input"
              placeholder={T("Entrez votre email","Your email","بريدك الإلكتروني")}/>
            <button className="btn btn-primary" onClick={() => setNewsletter("")}>
              {T("S'abonner","Subscribe","اشتراك")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-nav__logo" style={{color:"#94A3B8"}}>
              <span className="lp-nav__logo-icon">S</span>
              <span>Stage<span className="lp-accent">Flow</span></span>
            </Link>
            <p className="lp-footer__tagline">
              {T("La plateforme intelligente pour gérer les stages de A à Z.","The smart platform to manage internships from A to Z.","المنصة الذكية لإدارة التدريب من الألف إلى الياء.")}
            </p>
            <div className="lp-footer__socials">
              <a href="#" aria-label="Facebook"><FiFacebook size={17}/></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin size={17}/></a>
              <a href="#" aria-label="Instagram"><FiInstagram size={17}/></a>
              <a href="#" aria-label="Twitter"><FiTwitter size={17}/></a>
            </div>
          </div>

          <div className="lp-footer__col">
            <h4>{T("Navigation","Navigation","التنقل")}</h4>
            {T(
              ["Accueil","Fonctionnalités","À propos","Tarifs","Conditions"],
              ["Home","Features","About","Pricing","Terms"],
              ["الرئيسية","المميزات","حول","الأسعار","الشروط"]
            ).map(l => <a key={l} href="#">{l}</a>)}
          </div>

          <div className="lp-footer__col">
            <h4>{T("Ressources","Resources","الموارد")}</h4>
            {["FAQ","Blog","Guides",T("Aide","Help","مساعدة"),T("Conditions","Terms","الشروط")].map(l => <a key={l} href="#">{l}</a>)}
          </div>

          <div className="lp-footer__col">
            <h4>{T("Légal","Legal","قانوني")}</h4>
            {T(
              ["Mentions légales","Politique de confidentialité","CGU"],
              ["Mentions","Privacy Policy","Terms of Use"],
              ["ذكر المصدر","سياسة الخصوصية","الشروط العامة"]
            ).map(l => <a key={l} href="#">{l}</a>)}
          </div>

          <div className="lp-footer__col">
            <h4>Contact</h4>
            <span><FiMapPin size={13}/> Ariana, Tunis, Tunisie</span>
            <span><FiPhone size={13}/> +216 98 765 432</span>
            <span><FiMail size={13}/> contact@stageflow.tn</span>
          </div>
        </div>

        <div className="lp-footer__bottom">
          © 2024 StageFlow. {T("Tous droits réservés","All rights reserved","جميع الحقوق محفوظة")}.
        </div>
      </footer>

    </div>
  );
}