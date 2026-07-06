import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import LangFlags from "../../components/common/LangFlags.jsx";
import api from "../../services/api.js";
import "./Auth.css";

const T = {
  fr: {
    left1: "L'aventure", left2: "commence ici",
    leftSub: "Créez un compte pour rejoindre notre communauté",
    title: "Hello ! Welcome back",
    email: "Email", emailPh: "Entrez votre adresse email",
    password: "Mot de passe", passwordPh: "••••••••••••••",
    remember: "Se souvenir de moi", forgot: "Mot de passe oublié ?",
    submit: "Se connecter", or: "ou",
    noAccount: "Vous n'avez pas de compte ?", signup: "Créer un compte",
    loading: "Connexion...", errorDefault: "Email ou mot de passe incorrect",
  },
  en: {
    left1: "Adventure", left2: "start here",
    leftSub: "Create an account to join our community",
    title: "Hello ! Welcome back",
    email: "Email", emailPh: "Enter your email address",
    password: "Password", passwordPh: "••••••••••••••",
    remember: "Remember me", forgot: "Reset Password!",
    submit: "Login", or: "or",
    noAccount: "Don't have an account?", signup: "Create Account",
    loading: "Signing in...", errorDefault: "Incorrect email or password",
  },
  ar: {
    left1: "المغامرة", left2: "تبدأ هنا",
    leftSub: "أنشئ حساباً للانضمام إلى مجتمعنا",
    title: "مرحباً بك مجدداً",
    email: "البريد الإلكتروني", emailPh: "أدخل بريدك الإلكتروني",
    password: "كلمة المرور", passwordPh: "••••••••••••••",
    remember: "تذكرني", forgot: "نسيت كلمة المرور؟",
    submit: "دخول", or: "أو",
    noAccount: "ليس لديك حساب؟", signup: "إنشاء حساب",
    loading: "جارٍ الدخول...", errorDefault: "البريد أو كلمة المرور غير صحيحة",
  },
};

const ROUTES = {
  étudiant:   "/dashboard/student",
  entreprise: "/dashboard/company",
  encadrant:  "/dashboard/supervisor",
  admin:      "/dashboard/admin",
};

export default function Login() {
  const { lang } = useLang();
  const tr       = T[lang] || T.fr;
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Email non vérifié
      if (data.needsVerify) {
        navigate("/verify-email", { state: { email: data.email } });
        return;
      }

      // Mettre à jour AuthContext sans refaire un appel API
      loginWithToken(data.token, data.user);
      navigate(ROUTES[data.user?.role] || "/dashboard/student");

    } catch (err) {
      const d = err.response?.data;
      if (d?.needsVerify) {
        navigate("/verify-email", { state: { email: d.email } });
        return;
      }
      setError(d?.message || tr.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Panneau gauche ──────────────────────────────────────────────── */}
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

      {/* ── Panneau droit ───────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <LangFlags/>
          </div>

          {/* Icône marque */}
          <div className="auth-brand-icon"><span>S</span></div>

          <h1 className="auth-form-title">{tr.title}</h1>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form-body">

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">{tr.email}</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiMail size={16}/></span>
                <input type="email" className="auth-input" placeholder={tr.emailPh}
                  value={email} onChange={e => setEmail(e.target.value)} required/>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="auth-field">
              <label className="auth-label">{tr.password}</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiLock size={16}/></span>
                <input type={showPass ? "text" : "password"} className="auth-input"
                  placeholder={tr.passwordPh} value={password}
                  onChange={e => setPassword(e.target.value)} required/>
                <button type="button" className="auth-input-toggle"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="auth-row">
              <label className="auth-checkbox">
                <input type="checkbox" checked={remember}
                  onChange={e => setRemember(e.target.checked)}/>
                <span>{tr.remember}</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot">{tr.forgot}</Link>
            </div>

            {/* Bouton connexion */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? tr.loading : tr.submit}
            </button>

            {/* Séparateur */}
            <div className="auth-separator">
              <span/><em>{tr.or}</em><span/>
            </div>

            {/* Boutons sociaux */}
            <div className="auth-socials">
              <button type="button" className="auth-social-btn" title="Google">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button type="button" className="auth-social-btn" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button type="button" className="auth-social-btn" title="Apple">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>

            {/* Lien inscription */}
            <p className="auth-switch">
              {tr.noAccount}{" "}<Link to="/register">{tr.signup}</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}