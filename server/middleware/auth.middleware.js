import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/users.model.js";

// Protection des routes - vérifie le JWT et attache l'utilisateur à req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization || "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    const err = new Error("Non autorisé, token manquant");
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 401;
    throw err;
  }

  req.user = user;
  next();
});

// Vérifier les rôles autorisés
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error("Non authentifié");
      err.statusCode = 401;
      return next(err);
    }
    if (!allowedRoles.includes(req.user.role)) {
      const err = new Error("Accès refusé");
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
};
