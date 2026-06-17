import { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr");

  // Applique la direction RTL/LTR dès le chargement de l'app,
  // pas seulement au moment où l'utilisateur clique sur un bouton de langue
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
