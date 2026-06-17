import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight, FiBriefcase, FiBookOpen } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import "./Auth.css";

const t = {
  fr: { title: "Créer un compte", subtitle: "Rejoignez StageFlow dès aujourd'hui", name: "Nom complet", email: "Email", password: "Mot de passe", role: "Je suis", student: "Étudiant", company: "Entreprise", university: "Université", specialty: "Spécialité", submit: "Créer mon compte", hasAccount: "Vous avez déjà un compte ?", signin: "Se connecter" },
  en: { title: "Create account", subtitle: "Join StageFlow today", name: "Full name", email: "Email", password: "Password", role: "I am a", student: "Student", company: "Company", university: "University", specialty: "Specialty", submit: "Create my account", hasAccount: "Already have an account?", signin: "Sign in" },
  ar: { title: "إنشاء حساب", subtitle: "انضم إلى StageFlow اليوم", name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور", role: "أنا", student: "طالب", company: "شركة", university: "الجامعة", specialty: "التخصص", submit: "إنشاء حسابي", hasAccount: "هل لديك حساب؟", signin: "تسجيل الدخول" },
};

export default function Register() {
  const { lang } = useLang();
  const tr = t[lang] || t.fr;
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "étudiant", university: "", specialty: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate(form.role === "entreprise" ? "/dashboard/company" : "/dashboard/student");
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
        <form className="auth-form fade-in" onSubmit={handleSubmit}>
          <h1 className="auth-title">{tr.title}</h1>
          <p className="auth-subtitle">{tr.subtitle}</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="role-toggle">
            <button type="button"
              className={`role-toggle-btn ${form.role === "étudiant" ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "étudiant" })}>
              <FiBookOpen/> {tr.student}
            </button>
            <button type="button"
              className={`role-toggle-btn ${form.role === "entreprise" ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "entreprise" })}>
              <FiBriefcase/> {tr.company}
            </button>
          </div>

          <div className="form-group">
            <label className="label">{tr.name}</label>
            <div className="input-icon-wrapper">
              <FiUser className="input-icon"/>
              <input name="name" className="input" placeholder="Chaima Touj"
                value={form.name} onChange={handleChange} required/>
            </div>
          </div>

          <div className="form-group">
            <label className="label">{tr.email}</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon"/>
              <input type="email" name="email" className="input" placeholder="exemple@email.com"
                value={form.email} onChange={handleChange} required/>
            </div>
          </div>

          <div className="form-group">
            <label className="label">{tr.password}</label>
            <div className="input-icon-wrapper">
              <FiLock className="input-icon"/>
              <input type="password" name="password" className="input" placeholder="••••••••"
                value={form.password} onChange={handleChange} required minLength={6}/>
            </div>
          </div>

          {form.role === "étudiant" && (
            <div className="form-row">
              <div className="form-group">
                <label className="label">{tr.university}</label>
                <input name="university" className="input" placeholder="ESPRIT"
                  value={form.university} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label className="label">{tr.specialty}</label>
                <input name="specialty" className="input" placeholder="Informatique"
                  value={form.specialty} onChange={handleChange}/>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "..." : <>{tr.submit} <FiArrowRight/></>}
          </button>

          <p className="auth-switch">
            {tr.hasAccount} <Link to="/login">{tr.signin}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
