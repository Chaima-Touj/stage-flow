import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser, FiMail, FiLock, FiArrowRight, FiBriefcase,
  // eslint-disable-next-line no-unused-vars
  FiBookOpen, FiPlus, FiTrash2, FiChevronLeft, FiMapPin, FiCalendar
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import "./Auth.css";

const STEPS = ["Compte", "Formation", "Expériences", "Compétences", "Confirmation"];

const EMPTY_SKILL    = { name: "", level: "Débutant" };
const EMPTY_LANGUAGE = { name: "", level: "Courant" };
const EMPTY_EXP      = { company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "", technologies: "" };

export default function Register() {
  // eslint-disable-next-line no-unused-vars
  const { lang } = useLang();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(0);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Étape 0 — Compte
  const [account, setAccount] = useState({
    name: "", email: "", password: "", role: "étudiant",
    phone: "", university: "", specialty: "", bio: "",
  });

  // Étape 1 — Formation
  const [education, setEducation] = useState({
    institution: "", degree: "", fieldOfStudy: "",
    startDate: "", endDate: "", current: false, grade: "", courses: "",
  });

  // Étape 2 — Expériences Professionnelles
  const [experience, setExperience] = useState([]);

  // Étape 3 — Compétences & Langues
  const [skills, setSkills]         = useState([{ ...EMPTY_SKILL }]);
  const [languages, setLanguages]   = useState([{ ...EMPTY_LANGUAGE }]);
  const [socialLinks, setSocialLinks] = useState({ linkedin: "", github: "", portfolio: "" });

  // Handlers pour les Compétences
  const addSkill    = () => setSkills([...skills, { ...EMPTY_SKILL }]);
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));
  const updateSkill = (i, field, val) => setSkills(skills.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  // Handlers pour les Langues
  const addLang    = () => setLanguages([...languages, { ...EMPTY_LANGUAGE }]);
  const removeLang = (i) => setLanguages(languages.filter((_, idx) => idx !== i));
  const updateLang = (i, field, val) => setLanguages(languages.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  // Handlers pour les Expériences
  const addExp    = () => setExperience([...experience, { ...EMPTY_EXP }]);
  const removeExp = (i) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateExp = (i, field, val) => setExperience(experience.map((e, idx) => {
    if (idx === i) {
      if (field === "current" && val === true) {
        return { ...e, [field]: val, endDate: "" }; // Réinitialise la date de fin si l'expérience est en cours
      }
      return { ...e, [field]: val };
    }
    return e;
  }));

  const nextStep = (e) => {
    e.preventDefault();
    setError("");
    
    if (step === 0 && (!account.name || !account.email || !account.password)) {
      setError("Nom, email et mot de passe sont requis.");
      return;
    }
    
    // Si l'utilisateur choisit le rôle "entreprise", on saute directement à la confirmation
    if (step === 0 && account.role === "entreprise") {
      setStep(4); 
      return;
    }

    setStep((s) => s + 1);
  };

  const prevStep = () => { 
    setError(""); 
    if (step === 4 && account.role === "entreprise") {
      setStep(0);
    } else {
      setStep((s) => s - 1); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Préparation des données pour correspondre exactement à ton modèle Mongoose
    const payload = {
      ...account,
      education: account.role === "étudiant" && education.institution ? {
        ...education,
        startDate: education.startDate || null,
        endDate: education.current ? null : (education.endDate || null),
        courses: education.courses ? education.courses.split(",").map((c) => c.trim()).filter(Boolean) : [],
      } : undefined,
      
      skills: account.role === "étudiant" ? skills.filter((s) => s.name.trim()) : [],
      languages: account.role === "étudiant" ? languages.filter((l) => l.name.trim()) : [],
      
      experience: account.role === "étudiant" ? experience
        .filter((exp) => exp.company.trim() || exp.position.trim())
        .map((exp) => ({
          ...exp,
          startDate: exp.startDate || null,
          endDate: exp.current ? null : (exp.endDate || null),
          technologies: exp.technologies ? exp.technologies.split(",").map((t) => t.trim()).filter(Boolean) : [],
        })) : [],
      
      socialLinks: account.role === "étudiant" ? socialLinks : undefined,
    };

    try {
      await register(payload);
      navigate(account.role === "entreprise" ? "/dashboard/company" : "/dashboard/student");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/" className="auth-logo">
          <span className="logo-icon">S</span> StageFlow
        </Link>
        <div className="auth-illustration">
          <div className="illust-card">
            <div className="illust-avatar">🚀</div>
            <h3>Commencez votre parcours</h3>
            <p>Créez votre compte gratuitement et accédez à des centaines d'offres de stage.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form fade-in">

          {/* Indicateur d'étapes (Masqué ou adapté pour l'entreprise) */}
          <div className="register-steps">
            {account.role === "étudiant" ? (
              STEPS.map((s, i) => (
                <div key={s} className={`register-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                  <div className="register-step-dot">{i < step ? "✓" : i + 1}</div>
                  <span className="register-step-label">{s}</span>
                </div>
              ))
            ) : (
              ["Compte", "Confirmation"].map((s, i) => {
                const isConf = step === 4;
                const active = (i === 0 && !isConf) || (i === 1 && isConf);
                const done = i === 0 && isConf;
                return (
                  <div key={s} className={`register-step ${active ? "active" : ""} ${done ? "done" : ""}`}>
                    <div className="register-step-dot">{done ? "✓" : i + 1}</div>
                    <span className="register-step-label">{s}</span>
                  </div>
                );
              })
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* ─── Étape 0 : Compte ────────────────────────────────────── */}
          {step === 0 && (
            <form onSubmit={nextStep}>
              <h2 className="auth-title">Créer un compte</h2>

              <div className="role-toggle">
                <button type="button" className={`role-toggle-btn ${account.role === "étudiant" ? "active" : ""}`}
                  onClick={() => setAccount({ ...account, role: "étudiant" })}>
                  <FiBookOpen/> Étudiant
                </button>
                <button type="button" className={`role-toggle-btn ${account.role === "entreprise" ? "active" : ""}`}
                  onClick={() => setAccount({ ...account, role: "entreprise" })}>
                  <FiBriefcase/> Entreprise
                </button>
              </div>

              <div className="form-group">
                <label className="label">Nom complet *</label>
                <div className="input-icon-wrapper">
                  <FiUser className="input-icon"/>
                  <input name="name" className="input" placeholder="Chaima Touj"
                    value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} required/>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Email *</label>
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon"/>
                  <input type="email" name="email" className="input" placeholder="chaima@example.com"
                    value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} required/>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Mot de passe *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon"/>
                  <input type="password" name="password" className="input" placeholder="••••••••"
                    value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} required minLength={6}/>
                </div>
              </div>

              {account.role === "étudiant" && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Université</label>
                      <input className="input" placeholder="ESPRIT"
                        value={account.university} onChange={(e) => setAccount({ ...account, university: e.target.value })}/>
                    </div>
                    <div className="form-group">
                      <label className="label">Spécialité</label>
                      <input className="input" placeholder="Génie logiciel"
                        value={account.specialty} onChange={(e) => setAccount({ ...account, specialty: e.target.value })}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Bio courte</label>
                    <textarea className="input" rows="2" placeholder="Étudiante en génie logiciel, passionnée par..."
                      value={account.bio} onChange={(e) => setAccount({ ...account, bio: e.target.value })}/>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-block">
                Suivant <FiArrowRight/>
              </button>

              <p className="auth-switch">
                Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
              </p>
            </form>
          )}

          {/* ─── Étape 1 : Formation ─────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={nextStep}>
              <h2 className="auth-title">Formation</h2>

              <div className="form-group">
                <label className="label">Établissement</label>
                <input className="input" placeholder="ESPRIT"
                  value={education.institution} onChange={(e) => setEducation({ ...education, institution: e.target.value })}/>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Diplôme</label>
                  <input className="input" placeholder="Diplôme d'ingénieur en informatique"
                    value={education.degree} onChange={(e) => setEducation({ ...education, degree: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label className="label">Domaine / Spécialité</label>
                  <input className="input" placeholder="Génie logiciel"
                    value={education.fieldOfStudy} onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}/>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Date de début</label>
                  <input type="date" className="input"
                    value={education.startDate} onChange={(e) => setEducation({ ...education, startDate: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label className="label">Date de fin</label>
                  <input type="date" className="input" disabled={education.current}
                    value={education.endDate} onChange={(e) => setEducation({ ...education, endDate: e.target.value })}/>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={education.current}
                    onChange={(e) => setEducation({ ...education, current: e.target.checked })}/>
                  En cours
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Moyenne</label>
                  <input className="input" placeholder="14.5/20"
                    value={education.grade} onChange={(e) => setEducation({ ...education, grade: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label className="label">Matières clés (séparées par des virgules)</label>
                  <input className="input" placeholder="Algorithmique, Base de données, Génie logiciel, IA"
                    value={education.courses} onChange={(e) => setEducation({ ...education, courses: e.target.value })}/>
                </div>
              </div>

              <div className="register-nav">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  <FiChevronLeft/> Précédent
                </button>
                <button type="submit" className="btn btn-primary">
                  Suivant <FiArrowRight/>
                </button>
              </div>
            </form>
          )}

          {/* ─── Étape 2 : Expériences Professionnelles ───────────────── */}
          {step === 2 && (
            <form onSubmit={nextStep}>
              <h2 className="auth-title">Expériences Professionnelles</h2>
              
              {experience.length === 0 ? (
                <div className="empty-experience-state" style={{ textAlign: "center", padding: "1.5rem", border: "1px dashed #ccc", borderRadius: "8px", marginBottom: "1.5rem" }}>
                  <p style={{ color: "#666", marginBottom: "1rem" }}>Aucune expérience ajoutée pour le moment.</p>
                </div>
              ) : (
                experience.map((exp, i) => (
                  <div key={i} className="card dynamic-experience-card" style={{ padding: "1.5rem", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "1.5rem", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1rem" }}>
                      <h4 style={{ margin: 0, color: "#4a5568" }}>Expérience #{i + 1}</h4>
                      <button type="button" className="btn-icon-danger" style={{ marginLeft: "auto", background: "none", border: "none", color: "#e53e3e", cursor: "pointer" }} onClick={() => removeExp(i)}>
                        <FiTrash2 size={16} /> Supprimer
                      </button>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="label">Entreprise</label>
                        <input className="input" placeholder="BeeCoders" value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} required/>
                      </div>
                      <div className="form-group">
                        <label className="label">Poste</label>
                        <input className="input" placeholder="Stagiaire développeur full-stack" value={exp.position} onChange={(e) => updateExp(i, "position", e.target.value)} required/>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label">Localisation</label>
                      <div className="input-icon-wrapper">
                        <FiMapPin className="input-icon"/>
                        <input className="input" placeholder="Tunis" value={exp.location} onChange={(e) => updateExp(i, "location", e.target.value)}/>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="label">Date de début</label>
                        <input type="date" className="input" value={exp.startDate} onChange={(e) => updateExp(i, "startDate", e.target.value)}/>
                      </div>
                      <div className="form-group">
                        <label className="label">Date de fin</label>
                        <input type="date" className="input" disabled={exp.current} value={exp.endDate} onChange={(e) => updateExp(i, "endDate", e.target.value)}/>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(i, "current", e.target.checked)}/>
                        Poste actuel
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="label">Description des tâches</label>
                      <textarea className="input" rows="2" placeholder="Développement d'une plateforme de e-commerce avec MERN stack..." value={exp.description} onChange={(e) => updateExp(i, "description", e.target.value)}/>
                    </div>

                    <div className="form-group">
                      <label className="label">Technologies utilisées (séparées par des virgules)</label>
                      <input className="input" placeholder="React, Node.js, MongoDB, TypeScript" value={exp.technologies} onChange={(e) => updateExp(i, "technologies", e.target.value)}/>
                    </div>
                  </div>
                ))
              )}

              <button type="button" className="btn btn-outline btn-block" style={{ marginBottom: "1.5rem" }} onClick={addExp}>
                <FiPlus size={16}/> Ajouter une expérience professionnelle
              </button>

              <div className="register-nav">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  <FiChevronLeft/> Précédent
                </button>
                <button type="submit" className="btn btn-primary">
                  Suivant <FiArrowRight/>
                </button>
              </div>
            </form>
          )}

          {/* ─── Étape 3 : Compétences ───────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={nextStep}>
              <h2 className="auth-title">Compétences & Langues</h2>

              <h3 className="register-section-title">Compétences techniques</h3>
              {skills.map((s, i) => (
                <div key={i} className="form-row register-dynamic-row">
                  <input className="input" placeholder="React"
                    value={s.name} onChange={(e) => updateSkill(i, "name", e.target.value)}/>
                  <select className="input" value={s.level} onChange={(e) => updateSkill(i, "level", e.target.value)}>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Expert">Expert</option>
                  </select>
                  {skills.length > 1 && (
                    <button type="button" className="btn-icon-danger" onClick={() => removeSkill(i)}><FiTrash2 size={15}/></button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addSkill}>
                <FiPlus size={14}/> Ajouter une compétence
              </button>

              <h3 className="register-section-title" style={{ marginTop: "1.5rem" }}>Langues</h3>
              {languages.map((l, i) => (
                <div key={i} className="form-row register-dynamic-row">
                  <input className="input" placeholder="Français"
                    value={l.name} onChange={(e) => updateLang(i, "name", e.target.value)}/>
                  <select className="input" value={l.level} onChange={(e) => updateLang(i, "level", e.target.value)}>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Courant">Courant</option>
                    <option value="Natif">Natif</option>
                  </select>
                  {languages.length > 1 && (
                    <button type="button" className="btn-icon-danger" onClick={() => removeLang(i)}><FiTrash2 size={15}/></button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addLang}>
                <FiPlus size={14}/> Ajouter une langue
              </button>

              <h3 className="register-section-title" style={{ marginTop: "1.5rem" }}>Liens sociaux</h3>
              <div className="form-group">
                <label className="label">LinkedIn</label>
                <input className="input" placeholder="https://linkedin.com/in/chaima-touj"
                  value={socialLinks.linkedin} onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}/>
              </div>
              <div className="form-group">
                <label className="label">GitHub</label>
                <input className="input" placeholder="https://github.com/chaimatouj"
                  value={socialLinks.github} onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}/>
              </div>

              <div className="register-nav">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  <FiChevronLeft/> Précédent
                </button>
                <button type="submit" className="btn btn-primary">
                  Suivant <FiArrowRight/>
                </button>
              </div>
            </form>
          )}

          {/* ─── Étape 4 : Confirmation ──────────────────────────────── */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <h2 className="auth-title">Confirmer et créer</h2>

              <div className="register-summary card">
                <div className="register-summary-row">
                  <strong>Nom</strong><span>{account.name}</span>
                </div>
                <div className="register-summary-row">
                  <strong>Email</strong><span>{account.email}</span>
                </div>
                <div className="register-summary-row">
                  <strong>Rôle</strong><span>{account.role}</span>
                </div>
                {account.role === "étudiant" && account.university && (
                  <div className="register-summary-row">
                    <strong>Université</strong><span>{account.university}</span>
                  </div>
                )}
                {account.role === "étudiant" && education.institution && (
                  <div className="register-summary-row">
                    <strong>Formation</strong><span>{education.institution} — {education.degree}</span>
                  </div>
                )}
                {account.role === "étudiant" && experience.filter(e => e.company).length > 0 && (
                  <div className="register-summary-row">
                    <strong>Expériences</strong>
                    <span>{experience.filter(e => e.company).map(e => e.company).join(", ")}</span>
                  </div>
                )}
                {account.role === "étudiant" && skills.filter((s) => s.name).length > 0 && (
                  <div className="register-summary-row">
                    <strong>Compétences</strong>
                    <span>{skills.filter((s) => s.name).map((s) => s.name).join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="register-nav">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  <FiChevronLeft/> Précédent
                </button>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? "Création..." : <>Créer mon compte <FiArrowRight/></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}