import jwt from "jsonwebtoken";
import User from "../models/users.models.js";

// ─── Générer un JWT ────────────────────────────────────────────────────────────
export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── Protéger les routes (vérifier le token) ──────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Non authentifié. Veuillez vous connecter." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Utilisateur introuvable ou désactivé." });
    }

    req.user = user; // disponible dans toutes les routes suivantes
    next();

  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// ─── Restreindre par rôle ─────────────────────────────────────────────────────
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Accès refusé. Rôle requis : ${roles.join(", ")}` });
    }
    next();
  };
};