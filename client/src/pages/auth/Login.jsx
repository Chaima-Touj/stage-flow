import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import "./Auth.css";

const t = {
  fr: { title: "Bienvenue !", subtitle: "Connectez-vous à votre compte", email: "Email", password: "Mot de passe", forgot: "Mot de passe oublié ?", submit: "Se connecter", noAccount: "Vous n'avez pas de compte ?", signup: "S'inscrire", error: "Email ou mot de passe incorrect" },
  en: { title: "Welcome back!", subtitle: "Sign in to your account", email: "Email", password: "Password", forgot: "Forgot password?", submit: "Sign in", noAccount: "Don't have an account?", signup: "Sign up", error: "Incorrect email or password" },
  ar: { title: "مرحباً بك!", subtitle: "سجل الدخول إلى حسابك", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", submit: "تسجيل الدخول", noAccount: "ليس لديك حساب؟", signup: "إنشاء حساب", error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
};

export default function Login() {
  const { lang } = useLang();
  const tr = t[lang] || t.fr;
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      const routes = {
        étudiant:   "/dashboard/student",
        entreprise: "/dashboard/company",
        encadrant:  "/dashboard/supervisor",
        admin:      "/dashboard/admin",
      };
      navigate(routes[user.role] || "/dashboard/student");
    } catch (err) {
      setError(err.response?.data?.message || tr.error);
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
            <div className="illust-avatar">👩‍💻</div>
            <h3>Votre passerelle vers le succès</h3>
            <p>Connectez-vous pour accéder à votre espace personnel et gérer vos stages.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-form fade-in" onSubmit={handleSubmit}>
          <h1 className="auth-title">{tr.title}</h1>
          <p className="auth-subtitle">{tr.subtitle}</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="label">{tr.email}</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon"/>
              <input type="email" className="input" placeholder="exemple@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>
          </div>

          <div className="form-group">
            <label className="label">{tr.password}</label>
            <div className="input-icon-wrapper">
              <FiLock className="input-icon"/>
              <input type={showPass ? "text" : "password"} className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required/>
              <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff/> : <FiEye/>}
              </button>
            </div>
            <Link to="/forgot-password" className="forgot-link">{tr.forgot}</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "..." : <>{tr.submit} <FiArrowRight/></>}
          </button>

          <p className="auth-switch">
            {tr.noAccount} <Link to="/register">{tr.signup}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
