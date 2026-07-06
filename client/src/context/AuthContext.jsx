import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Au démarrage : si un token existe, on valide avec le serveur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login standard via authService
  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });

    // Gérer le cas needsVerify
    if (data.needsVerify) return data;

    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  // Connexion directe depuis un token déjà obtenu (évite le double appel)
  const loginWithToken = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    // Si needsVerify, on ne stocke pas le token
    if (data.needsVerify) return data;
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.user);
      return data.user;
    } catch {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);