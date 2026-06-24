import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser, FiMail, FiLock, FiArrowRight, FiBriefcase,
  FiBookOpen, FiPlus, FiTrash2, FiChevronLeft, FiMapPin,
  FiEye, FiEyeOff,
} from "react-icons/fi";
import { useLang } from "../../context/LangContext.jsx";
import api from "../../services/api.js";
import "./Auth.css";

/* ─── Composants utilitaires — EN DEHORS du composant principal ─────────── */
const Field = ({ label, children }) => (
  <div className="auth-field">
    {label && <label className="auth-label">{label}</label>}
    {children}
  </div>
);

const AuthInput = ({ icon, ...props }) => (
  <div className="auth-input-wrap">
    {icon && <span className="auth-input-icon">{icon}</span>}
    <input
      className="auth-input"
      style={icon ? {} : { paddingLeft: "1rem" }}
      {...props}
    />
  </div>
);

/* ─── Traductions ────────────────────────────────────────────────────────── */
const T = {
  fr: {
    left1: "L'aventure", left2: "commence ici",
    leftSub: "Créez un compte pour rejoindre notre communauté",
    createAccount: "Créer un compte",
    alreadyAccount: "Vous avez déjà un compte ?", signin: "Se connecter",
    next: "Suivant", prev: "Précédent", confirm: "Créer mon compte",
    creating: "Création...",
    steps: { student: ["Compte","Formation","Expériences","Compétences","Confirmation"], company: ["Compte","Confirmation"] },
    roles: { student: "Étudiant", company: "Entreprise" },
    f: {
      fullName:"Nom complet", namePh:"Chaima Touj",
      email:"Email", emailPh:"chaima@example.com",
      password:"Mot de passe", passwordPh:"••••••••",
      university:"Université", universityPh:"ESPRIT",
      specialty:"Spécialité", specialtyPh:"Génie logiciel",
      bio:"Bio courte", bioPh:"Étudiante passionnée par...",
      institution:"Établissement", institutionPh:"ESPRIT",
      degree:"Diplôme", degreePh:"Diplôme d'ingénieur",
      fieldOfStudy:"Domaine", fieldPh:"Génie logiciel",
      startDate:"Début", endDate:"Fin", inProgress:"En cours",
      grade:"Moyenne", gradePh:"14.5/20",
      courses:"Matières clés (virgules)", coursesPh:"Algo, BDD, IA",
      company:"Entreprise", companyPh:"BeeCoders",
      position:"Poste", positionPh:"Stagiaire développeur",
      location:"Lieu", locationPh:"Tunis",
      current:"Poste actuel",
      description:"Description", descPh:"Développement d'une plateforme...",
      technologies:"Technologies (virgules)", techPh:"React, Node.js",
      addExp:"+ Ajouter une expérience",
      noExp:"Aucune expérience ajoutée.",
      skills:"Compétences techniques", addSkill:"+ Compétence",
      languages:"Langues", addLang:"+ Langue",
      social:"Liens sociaux",
      skillLevels:["Débutant","Intermédiaire","Avancé","Expert"],
      langLevels:["Débutant","Intermédiaire","Courant","Natif"],
      summary:"Récapitulatif", nameLabel:"Nom", roleLabel:"Rôle",
      formationLabel:"Formation", expLabel:"Expériences", skillsLabel:"Compétences",
    },
    errors: { required:"Nom, email et mot de passe sont requis.", default:"Erreur lors de l'inscription" },
  },
  en: {
    left1: "Adventure", left2: "start here",
    leftSub: "Create an account to join our community",
    createAccount: "Create Account",
    alreadyAccount: "Already have an account?", signin: "Sign in",
    next: "Next", prev: "Back", confirm: "Create my account",
    creating: "Creating...",
    steps: { student: ["Account","Education","Experience","Skills","Confirm"], company: ["Account","Confirm"] },
    roles: { student: "Student", company: "Company" },
    f: {
      fullName:"Full name", namePh:"Chaima Touj",
      email:"Email", emailPh:"chaima@example.com",
      password:"Password", passwordPh:"••••••••",
      university:"University", universityPh:"ESPRIT",
      specialty:"Specialty", specialtyPh:"Software Engineering",
      bio:"Short bio", bioPh:"Student passionate about...",
      institution:"Institution", institutionPh:"ESPRIT",
      degree:"Degree", degreePh:"Engineering Degree",
      fieldOfStudy:"Field", fieldPh:"Software Engineering",
      startDate:"Start", endDate:"End", inProgress:"In progress",
      grade:"Grade", gradePh:"14.5/20",
      courses:"Key courses (comma)", coursesPh:"Algo, DB, AI",
      company:"Company", companyPh:"BeeCoders",
      position:"Position", positionPh:"Intern developer",
      location:"Location", locationPh:"Tunis",
      current:"Current position",
      description:"Description", descPh:"Development of a platform...",
      technologies:"Technologies (comma)", techPh:"React, Node.js",
      addExp:"+ Add experience",
      noExp:"No experience added yet.",
      skills:"Technical skills", addSkill:"+ Skill",
      languages:"Languages", addLang:"+ Language",
      social:"Social links",
      skillLevels:["Beginner","Intermediate","Advanced","Expert"],
      langLevels:["Beginner","Intermediate","Fluent","Native"],
      summary:"Summary", nameLabel:"Name", roleLabel:"Role",
      formationLabel:"Education", expLabel:"Experiences", skillsLabel:"Skills",
    },
    errors: { required:"Name, email and password are required.", default:"Registration error" },
  },
  ar: {
    left1: "المغامرة", left2: "تبدأ هنا",
    leftSub: "أنشئ حساباً للانضمام إلى مجتمعنا",
    createAccount: "إنشاء حساب",
    alreadyAccount: "لديك حساب بالفعل؟", signin: "تسجيل الدخول",
    next: "التالي", prev: "السابق", confirm: "إنشاء حسابي",
    creating: "جارٍ الإنشاء...",
    steps: { student: ["الحساب","التكوين","الخبرات","المهارات","التأكيد"], company: ["الحساب","التأكيد"] },
    roles: { student: "طالب", company: "مؤسسة" },
    f: {
      fullName:"الاسم الكامل", namePh:"شيماء توج",
      email:"البريد الإلكتروني", emailPh:"chaima@example.com",
      password:"كلمة المرور", passwordPh:"••••••••",
      university:"الجامعة", universityPh:"ESPRIT",
      specialty:"التخصص", specialtyPh:"هندسة البرمجيات",
      bio:"نبذة قصيرة", bioPh:"طالبة شغوفة بـ...",
      institution:"المؤسسة التعليمية", institutionPh:"ESPRIT",
      degree:"الشهادة", degreePh:"شهادة مهندس",
      fieldOfStudy:"المجال", fieldPh:"هندسة البرمجيات",
      startDate:"البداية", endDate:"النهاية", inProgress:"جارٍ",
      grade:"المعدل", gradePh:"14.5/20",
      courses:"المواد (فاصلة)", coursesPh:"خوارزميات، قواعد بيانات",
      company:"المؤسسة", companyPh:"BeeCoders",
      position:"المنصب", positionPh:"متدرب مطور",
      location:"الموقع", locationPh:"تونس",
      current:"منصب حالي",
      description:"الوصف", descPh:"تطوير منصة...",
      technologies:"التقنيات (فاصلة)", techPh:"React, Node.js",
      addExp:"+ إضافة خبرة",
      noExp:"لا توجد خبرات مضافة.",
      skills:"المهارات التقنية", addSkill:"+ مهارة",
      languages:"اللغات", addLang:"+ لغة",
      social:"روابط التواصل",
      skillLevels:["مبتدئ","متوسط","متقدم","خبير"],
      langLevels:["مبتدئ","متوسط","جيد","أصلي"],
      summary:"ملخص", nameLabel:"الاسم", roleLabel:"الدور",
      formationLabel:"التكوين", expLabel:"الخبرات", skillsLabel:"المهارات",
    },
    errors: { required:"الاسم والبريد وكلمة المرور مطلوبة.", default:"خطأ أثناء التسجيل" },
  },
};

const EMPTY_SKILL    = { name: "", level: "Débutant" };
const EMPTY_LANGUAGE = { name: "", level: "Courant" };
const EMPTY_EXP      = { company:"", position:"", location:"", startDate:"", endDate:"", current:false, description:"", technologies:"" };

/* ─── Composant principal ────────────────────────────────────────────────── */
export default function Register() {
  const { lang, changeLang } = useLang();
  const tr  = T[lang] || T.fr;
  const f   = tr.f;
  const navigate = useNavigate();

  const [step,     setStep]     = useState(0);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [account,    setAccount]    = useState({ name:"", email:"", password:"", role:"étudiant", phone:"", university:"", specialty:"", bio:"" });
  const [education,  setEducation]  = useState({ institution:"", degree:"", fieldOfStudy:"", startDate:"", endDate:"", current:false, grade:"", courses:"" });
  const [experience, setExperience] = useState([]);
  const [skills,     setSkills]     = useState([{ ...EMPTY_SKILL }]);
  const [languages,  setLanguages]  = useState([{ ...EMPTY_LANGUAGE }]);
  const [socialLinks,setSocialLinks]= useState({ linkedin:"", github:"", portfolio:"" });

  const addSkill    = () => setSkills([...skills, { ...EMPTY_SKILL }]);
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));
  const updateSkill = (i, field, val) => setSkills(skills.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const addLang    = () => setLanguages([...languages, { ...EMPTY_LANGUAGE }]);
  const removeLang = (i) => setLanguages(languages.filter((_, idx) => idx !== i));
  const updateLang = (i, field, val) => setLanguages(languages.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const addExp    = () => setExperience([...experience, { ...EMPTY_EXP }]);
  const removeExp = (i) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateExp = (i, field, val) => setExperience(experience.map((e, idx) => {
    if (idx !== i) return e;
    if (field === "current" && val) return { ...e, [field]: val, endDate: "" };
    return { ...e, [field]: val };
  }));

  const nextStep = (e) => {
    e.preventDefault();
    setError("");
    if (step === 0 && (!account.name || !account.email || !account.password)) {
      setError(tr.errors.required);
      return;
    }
    if (step === 0 && account.role === "entreprise") { setStep(4); return; }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError("");
    if (step === 4 && account.role === "entreprise") { setStep(0); return; }
    setStep(s => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...account,
      education: account.role === "étudiant" && education.institution ? {
        ...education,
        startDate: education.startDate || null,
        endDate:   education.current ? null : (education.endDate || null),
        courses:   education.courses ? education.courses.split(",").map(c => c.trim()).filter(Boolean) : [],
      } : undefined,
      skills:     account.role === "étudiant" ? skills.filter(s => s.name.trim()) : [],
      languages:  account.role === "étudiant" ? languages.filter(l => l.name.trim()) : [],
      experience: account.role === "étudiant" ? experience
        .filter(exp => exp.company.trim() || exp.position.trim())
        .map(exp => ({ ...exp, startDate: exp.startDate || null, endDate: exp.current ? null : (exp.endDate || null), technologies: exp.technologies ? exp.technologies.split(",").map(t => t.trim()).filter(Boolean) : [] })) : [],
      socialLinks: account.role === "étudiant" ? socialLinks : undefined,
    };

    try {
      const { data } = await api.post("/auth/register", payload);
      if (data.needsVerify) {
        navigate("/verify-email", { state: { email: data.email } });
        return;
      }
      navigate(account.role === "entreprise" ? "/dashboard/company" : "/dashboard/student");
    } catch (err) {
      setError(err.response?.data?.message || tr.errors.default);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = account.role === "étudiant" ? tr.steps.student : tr.steps.company;
  const stepIndex  = account.role === "entreprise" && step === 4 ? 1 : step;

  const btnStyle = { border:"1.5px dashed var(--primary)", borderRadius:"8px", background:"transparent", color:"var(--primary)", padding:"0.4rem 0.75rem", cursor:"pointer", fontSize:"0.85rem", fontWeight:600, display:"inline-flex", alignItems:"center", gap:"0.25rem" };
  const cardStyle = { background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"12px", padding:"1.25rem", marginBottom:"1rem" };
  const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" };

  return (
    <div className="auth-page">

      {/* ── Panneau gauche ─────────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-shape auth-shape--circle1"/>
        <div className="auth-shape auth-shape--circle2"/>
        <div className="auth-shape auth-shape--rect1"/>
        <div className="auth-shape auth-shape--rect2"/>
        <div className="auth-shape auth-shape--dot1"/>
        <div className="auth-shape auth-shape--dot2"/>
        <div className="auth-shape auth-shape--ring"/>
        <div className="auth-shape auth-shape--arc"/>
        <Link to="/" className="auth-left__logo">
          <span className="auth-left__logo-icon">S</span>
          <span>Stage<span style={{opacity:0.85}}>Flow</span></span>
        </Link>
        <div className="auth-left__content">
          <h2 className="auth-left__title">{tr.left1}<br/>{tr.left2}</h2>
          <p className="auth-left__sub">{tr.leftSub}</p>
        </div>
      </div>

      {/* ── Panneau droit ──────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap" style={{maxWidth:480, overflowY:"auto", maxHeight:"100vh", paddingTop:"1.5rem", paddingBottom:"1.5rem"}}>

          {/* Langue */}
          <div className="auth-lang-switch">
            {["fr","en","ar"].map(l => (
              <button key={l} onClick={() => changeLang(l)}
                className={`auth-lang-btn ${lang === l ? "active" : ""}`}>
                {l === "fr" ? "🇫🇷 Fr" : l === "en" ? "🇬🇧 En" : "🇹🇳 Ar"}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="auth-steps">
            {stepLabels.map((label, i) => (
              <div key={i} className={`auth-step ${i === stepIndex ? "active" : ""} ${i < stepIndex ? "done" : ""}`}>
                <div className="auth-step-dot">{i < stepIndex ? "✓" : i + 1}</div>
                <span className="auth-step-label">{label}</span>
              </div>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* ── Étape 0 : Compte ─────────────────────────────────────── */}
          {step === 0 && (
            <form onSubmit={nextStep} className="auth-form-body">
              <h2 className="auth-form-title" style={{marginBottom:"1rem"}}>{tr.createAccount}</h2>

              <div className="auth-role-toggle" style={{marginBottom:"1.25rem"}}>
                <button type="button" className={`auth-role-btn ${account.role === "étudiant" ? "active" : ""}`}
                  onClick={() => setAccount({...account, role:"étudiant"})}>
                  <FiBookOpen size={15}/> {tr.roles.student}
                </button>
                <button type="button" className={`auth-role-btn ${account.role === "entreprise" ? "active" : ""}`}
                  onClick={() => setAccount({...account, role:"entreprise"})}>
                  <FiBriefcase size={15}/> {tr.roles.company}
                </button>
              </div>

              <Field label={`${f.fullName} *`}>
                <AuthInput icon={<FiUser size={15}/>} placeholder={f.namePh}
                  value={account.name} onChange={e => setAccount({...account, name:e.target.value})} required/>
              </Field>

              <Field label={`${f.email} *`}>
                <AuthInput icon={<FiMail size={15}/>} type="email" placeholder={f.emailPh}
                  value={account.email} onChange={e => setAccount({...account, email:e.target.value})} required/>
              </Field>

              <Field label={`${f.password} *`}>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><FiLock size={15}/></span>
                  <input type={showPass ? "text" : "password"} className="auth-input"
                    placeholder={f.passwordPh} value={account.password} required minLength={6}
                    onChange={e => setAccount({...account, password:e.target.value})}/>
                  <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                  </button>
                </div>
              </Field>

              {account.role === "étudiant" && (
                <>
                  <div style={grid2}>
                    <Field label={f.university}>
                      <AuthInput placeholder={f.universityPh} value={account.university}
                        onChange={e => setAccount({...account, university:e.target.value})}/>
                    </Field>
                    <Field label={f.specialty}>
                      <AuthInput placeholder={f.specialtyPh} value={account.specialty}
                        onChange={e => setAccount({...account, specialty:e.target.value})}/>
                    </Field>
                  </div>
                  <Field label={f.bio}>
                    <textarea className="auth-input" rows={2} placeholder={f.bioPh}
                      style={{paddingLeft:"1rem", paddingTop:"0.75rem", resize:"vertical"}}
                      value={account.bio} onChange={e => setAccount({...account, bio:e.target.value})}/>
                  </Field>
                </>
              )}

              <button type="submit" className="auth-submit-btn" style={{marginTop:"0.5rem"}}>
                {tr.next} <FiArrowRight size={16}/>
              </button>
              <p className="auth-switch" style={{marginTop:"1rem"}}>
                {tr.alreadyAccount} <Link to="/login">{tr.signin}</Link>
              </p>
            </form>
          )}

          {/* ── Étape 1 : Formation ──────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={nextStep} className="auth-form-body">
              <h2 className="auth-form-title" style={{marginBottom:"1rem"}}>{tr.steps.student[1]}</h2>

              <Field label={f.institution}>
                <AuthInput placeholder={f.institutionPh} value={education.institution}
                  onChange={e => setEducation({...education, institution:e.target.value})}/>
              </Field>

              <div style={grid2}>
                <Field label={f.degree}>
                  <AuthInput placeholder={f.degreePh} value={education.degree}
                    onChange={e => setEducation({...education, degree:e.target.value})}/>
                </Field>
                <Field label={f.fieldOfStudy}>
                  <AuthInput placeholder={f.fieldPh} value={education.fieldOfStudy}
                    onChange={e => setEducation({...education, fieldOfStudy:e.target.value})}/>
                </Field>
                <Field label={f.startDate}>
                  <AuthInput type="date" value={education.startDate}
                    onChange={e => setEducation({...education, startDate:e.target.value})}/>
                </Field>
                <Field label={f.endDate}>
                  <AuthInput type="date" disabled={education.current} value={education.endDate}
                    onChange={e => setEducation({...education, endDate:e.target.value})}/>
                </Field>
                <Field label={f.grade}>
                  <AuthInput placeholder={f.gradePh} value={education.grade}
                    onChange={e => setEducation({...education, grade:e.target.value})}/>
                </Field>
                <Field label={f.courses}>
                  <AuthInput placeholder={f.coursesPh} value={education.courses}
                    onChange={e => setEducation({...education, courses:e.target.value})}/>
                </Field>
              </div>

              <label className="auth-checkbox" style={{margin:"0.5rem 0 1rem"}}>
                <input type="checkbox" checked={education.current}
                  onChange={e => setEducation({...education, current:e.target.checked})}/>
                <span>{f.inProgress}</span>
              </label>

              <div className="auth-nav">
                <button type="button" className="auth-nav-back" onClick={prevStep}>
                  <FiChevronLeft/> {tr.prev}
                </button>
                <button type="submit" className="auth-submit-btn" style={{marginBottom:0}}>
                  {tr.next} <FiArrowRight size={15}/>
                </button>
              </div>
            </form>
          )}

          {/* ── Étape 2 : Expériences ────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={nextStep} className="auth-form-body">
              <h2 className="auth-form-title" style={{marginBottom:"1rem"}}>{tr.steps.student[2]}</h2>

              {experience.length === 0 && (
                <div style={{textAlign:"center", padding:"1.5rem", border:"1.5px dashed var(--border)", borderRadius:"12px", color:"var(--text-muted)", marginBottom:"1rem"}}>
                  {f.noExp}
                </div>
              )}

              {experience.map((exp, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem"}}>
                    <span style={{fontWeight:700, fontSize:"0.9rem"}}>#{i+1}</span>
                    <button type="button" onClick={() => removeExp(i)}
                      style={{border:"none", background:"none", color:"#EF4444", cursor:"pointer", fontSize:"0.8rem", display:"flex", alignItems:"center", gap:"0.25rem"}}>
                      <FiTrash2 size={13}/> Supprimer
                    </button>
                  </div>
                  <div style={grid2}>
                    <Field label={f.company}>
                      <AuthInput placeholder={f.companyPh} value={exp.company}
                        onChange={e => updateExp(i,"company",e.target.value)}/>
                    </Field>
                    <Field label={f.position}>
                      <AuthInput placeholder={f.positionPh} value={exp.position}
                        onChange={e => updateExp(i,"position",e.target.value)}/>
                    </Field>
                  </div>
                  <Field label={f.location}>
                    <AuthInput icon={<FiMapPin size={14}/>} placeholder={f.locationPh}
                      value={exp.location} onChange={e => updateExp(i,"location",e.target.value)}/>
                  </Field>
                  <div style={grid2}>
                    <Field label={f.startDate}>
                      <AuthInput type="date" value={exp.startDate}
                        onChange={e => updateExp(i,"startDate",e.target.value)}/>
                    </Field>
                    <Field label={f.endDate}>
                      <AuthInput type="date" disabled={exp.current} value={exp.endDate}
                        onChange={e => updateExp(i,"endDate",e.target.value)}/>
                    </Field>
                  </div>
                  <label className="auth-checkbox" style={{margin:"0.25rem 0 0.75rem"}}>
                    <input type="checkbox" checked={exp.current}
                      onChange={e => updateExp(i,"current",e.target.checked)}/>
                    <span>{f.current}</span>
                  </label>
                  <Field label={f.description}>
                    <textarea className="auth-input" rows={2} placeholder={f.descPh}
                      style={{paddingLeft:"1rem", paddingTop:"0.75rem", resize:"vertical"}}
                      value={exp.description} onChange={e => updateExp(i,"description",e.target.value)}/>
                  </Field>
                  <Field label={f.technologies}>
                    <AuthInput placeholder={f.techPh} value={exp.technologies}
                      onChange={e => updateExp(i,"technologies",e.target.value)}/>
                  </Field>
                </div>
              ))}

              <button type="button" onClick={addExp} style={{...btnStyle, width:"100%", justifyContent:"center", marginBottom:"1rem", padding:"0.75rem"}}>
                {f.addExp}
              </button>

              <div className="auth-nav">
                <button type="button" className="auth-nav-back" onClick={prevStep}>
                  <FiChevronLeft/> {tr.prev}
                </button>
                <button type="submit" className="auth-submit-btn" style={{marginBottom:0}}>
                  {tr.next} <FiArrowRight size={15}/>
                </button>
              </div>
            </form>
          )}

          {/* ── Étape 3 : Compétences ────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={nextStep} className="auth-form-body">
              <h2 className="auth-form-title" style={{marginBottom:"1rem"}}>{tr.steps.student[3]}</h2>

              <p style={{fontWeight:700, fontSize:"0.85rem", color:"var(--text)", marginBottom:"0.5rem"}}>{f.skills}</p>
              {skills.map((s, i) => (
                <div key={i} style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"0.5rem", marginBottom:"0.5rem", alignItems:"center"}}>
                  <AuthInput placeholder="React" value={s.name}
                    onChange={e => updateSkill(i,"name",e.target.value)}/>
                  <select className="auth-input" style={{paddingLeft:"0.75rem"}}
                    value={s.level} onChange={e => updateSkill(i,"level",e.target.value)}>
                    {f.skillLevels.map(l => <option key={l}>{l}</option>)}
                  </select>
                  {skills.length > 1 && (
                    <button type="button" onClick={() => removeSkill(i)}
                      style={{border:"none", background:"none", color:"#EF4444", cursor:"pointer"}}>
                      <FiTrash2 size={15}/>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSkill} style={{...btnStyle, marginBottom:"1rem"}}>
                <FiPlus size={13}/> {f.addSkill}
              </button>

              <p style={{fontWeight:700, fontSize:"0.85rem", color:"var(--text)", margin:"0.75rem 0 0.5rem"}}>{f.languages}</p>
              {languages.map((l, i) => (
                <div key={i} style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"0.5rem", marginBottom:"0.5rem", alignItems:"center"}}>
                  <AuthInput placeholder="Français" value={l.name}
                    onChange={e => updateLang(i,"name",e.target.value)}/>
                  <select className="auth-input" style={{paddingLeft:"0.75rem"}}
                    value={l.level} onChange={e => updateLang(i,"level",e.target.value)}>
                    {f.langLevels.map(lv => <option key={lv}>{lv}</option>)}
                  </select>
                  {languages.length > 1 && (
                    <button type="button" onClick={() => removeLang(i)}
                      style={{border:"none", background:"none", color:"#EF4444", cursor:"pointer"}}>
                      <FiTrash2 size={15}/>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLang} style={{...btnStyle, marginBottom:"1rem"}}>
                <FiPlus size={13}/> {f.addLang}
              </button>

              <p style={{fontWeight:700, fontSize:"0.85rem", color:"var(--text)", margin:"0.75rem 0 0.5rem"}}>{f.social}</p>
              <Field label="LinkedIn">
                <AuthInput placeholder="https://linkedin.com/in/chaima-touj"
                  value={socialLinks.linkedin}
                  onChange={e => setSocialLinks({...socialLinks, linkedin:e.target.value})}/>
              </Field>
              <Field label="GitHub">
                <AuthInput placeholder="https://github.com/chaimatouj"
                  value={socialLinks.github}
                  onChange={e => setSocialLinks({...socialLinks, github:e.target.value})}/>
              </Field>

              <div className="auth-nav">
                <button type="button" className="auth-nav-back" onClick={prevStep}>
                  <FiChevronLeft/> {tr.prev}
                </button>
                <button type="submit" className="auth-submit-btn" style={{marginBottom:0}}>
                  {tr.next} <FiArrowRight size={15}/>
                </button>
              </div>
            </form>
          )}

          {/* ── Étape 4 : Confirmation ───────────────────────────────── */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="auth-form-body">
              <h2 className="auth-form-title" style={{marginBottom:"1rem"}}>{f.summary}</h2>

              <div style={{...cardStyle, display:"flex", flexDirection:"column", gap:"0.75rem"}}>
                {[
                  [f.nameLabel, account.name],
                  [f.email, account.email],
                  [f.roleLabel, account.role === "étudiant" ? tr.roles.student : tr.roles.company],
                  account.university ? [f.university, account.university] : null,
                  education.institution ? [f.formationLabel, `${education.institution} — ${education.degree}`] : null,
                  experience.filter(e => e.company).length > 0 ? [f.expLabel, experience.filter(e => e.company).map(e => e.company).join(", ")] : null,
                  skills.filter(s => s.name).length > 0 ? [f.skillsLabel, skills.filter(s => s.name).map(s => s.name).join(", ")] : null,
                ].filter(Boolean).map(([label, value], i) => (
                  <div key={i} style={{display:"flex", justifyContent:"space-between", fontSize:"0.875rem", gap:"1rem"}}>
                    <span style={{color:"var(--text-secondary)", fontWeight:600, flexShrink:0}}>{label}</span>
                    <span style={{color:"var(--text)", textAlign:"right"}}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="auth-nav">
                <button type="button" className="auth-nav-back" onClick={prevStep}>
                  <FiChevronLeft/> {tr.prev}
                </button>
                <button type="submit" className="auth-submit-btn" style={{marginBottom:0}} disabled={loading}>
                  {loading ? tr.creating : <>{tr.confirm} <FiArrowRight size={15}/></>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}