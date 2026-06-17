import User from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, university, specialty, supervisorId } = req.body;

  if (!name || !email || !password) {
    const err = new Error("Champs requis manquants");
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email déjà utilisé");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role, phone, university, specialty, supervisorId });
  const token = signToken({ id: user._id });

  console.log(`📝 Nouvelle inscription : ${user.name} (${user.email}) — rôle: ${user.role}`);

  res.status(201).json({ token, user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error("Email et mot de passe requis");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    console.log(`⚠️  Tentative de connexion échouée pour : ${email}`);
    const err = new Error("Identifiants invalides");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user._id });

  console.log(`✅ Connexion : ${user.name} (${user.email}) — rôle: ${user.role}`);

  res.json({ token, user });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  console.log(`👋 Déconnexion : ${req.user?.name || "utilisateur inconnu"}`);
  res.json({ message: "Déconnecté avec succès" });
});
