import crypto from "crypto";
import User from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import emailService from "../services/email.service.js";

// Rôles autorisés à l'inscription publique
const ALLOWED_REGISTER_ROLES = ["étudiant", "entreprise"];

// Génère un code à 6 chiffres
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const {
    name, email, password, role, phone, university, specialty,
    bio, education, experience, skills, languages, socialLinks,
  } = req.body;

  if (!name || !email || !password) {
    const err = new Error("Champs requis manquants");
    err.statusCode = 400;
    throw err;
  }

  const safeRole = ALLOWED_REGISTER_ROLES.includes(role) ? role : "étudiant";

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email déjà utilisé");
    err.statusCode = 409;
    throw err;
  }

  // Générer le code de vérification
  const code    = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await User.create({
    name, email, password,
    role: safeRole,
    phone, university, specialty,
    bio, education, experience, skills, languages, socialLinks,
    isVerified:        false,
    verifyCode:        code,
    verifyCodeExpires: expires,
  });

  console.log(`📝 Nouvelle inscription : ${user.name} (${user.email}) — rôle: ${user.role}`);

  // Email de bienvenue (non-bloquant, non critique pour le flux d'inscription)
  emailService.sendWelcome(user.email, { name: user.name, role: user.role });

  // Email admin (non-bloquant, non critique)
  User.findOne({ role: "admin" }).select("email").lean().then((admin) => {
    if (admin?.email) {
      emailService.sendNewUserAdmin(admin.email, {
        userName:  user.name,
        userEmail: user.email,
        userRole:  user.role,
      });
    }
  });

  // Code de vérification : critique pour la suite du flux, on attend le résultat réel.
  const codeResult = await emailService.sendVerifyCode(user.email, { name: user.name, code });
  if (!codeResult.success) {
    console.error(`⚠️  Code de vérification non envoyé à ${user.email} : ${codeResult.error}`);
  }

  // On renvoie l'email pour que le frontend sache où rediriger
  res.status(201).json({
    message:     "Compte créé. Vérifiez votre email pour obtenir le code.",
    email:       user.email,
    needsVerify: true,
    emailSent:   codeResult.success,
  });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    const err = new Error("Email et code requis");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email })
    .select("+verifyCode +verifyCodeExpires +password");

  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (user.isVerified) {
    const err = new Error("Email déjà vérifié");
    err.statusCode = 400;
    throw err;
  }

  // Vérifier expiration
  if (!user.verifyCodeExpires || user.verifyCodeExpires < new Date()) {
    const err = new Error("Code expiré. Demandez un nouveau code.");
    err.statusCode = 400;
    throw err;
  }

  // Vérifier le code
  if (user.verifyCode !== String(code).trim()) {
    const err = new Error("Code incorrect.");
    err.statusCode = 400;
    throw err;
  }

  // Marquer comme vérifié et effacer le code
  user.isVerified        = true;
  user.verifyCode        = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();

  const token = signToken({ id: user._id });
  console.log(`✅ Email vérifié : ${user.name} (${user.email})`);

  res.json({ token, user });
});

// POST /api/auth/resend-code
export const resendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    const err = new Error("Email requis");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email })
    .select("+verifyCode +verifyCodeExpires");

  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (user.isVerified) {
    const err = new Error("Email déjà vérifié");
    err.statusCode = 400;
    throw err;
  }

  // Générer un nouveau code
  const code    = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  user.verifyCode        = code;
  user.verifyCodeExpires = expires;
  await user.save();

  const codeResult = await emailService.sendVerifyCode(user.email, { name: user.name, code });
  if (!codeResult.success) {
    console.error(`⚠️  Code de vérification non renvoyé à ${user.email} : ${codeResult.error}`);
    const err = new Error("Échec de l'envoi de l'email. Réessayez dans quelques instants.");
    err.statusCode = 502;
    throw err;
  }

  console.log(`🔄 Code renvoyé à : ${user.email}`);
  res.json({ message: "Nouveau code envoyé sur votre email." });
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

  // Bloquer si email non vérifié (première connexion)
  if (!user.isVerified) {
    // Renvoyer un code frais automatiquement
    const code    = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      verifyCode:        code,
      verifyCodeExpires: expires,
    });

    const codeResult = await emailService.sendVerifyCode(user.email, { name: user.name, code });
    if (!codeResult.success) {
      console.error(`⚠️  Code de vérification non envoyé à ${user.email} : ${codeResult.error}`);
    }

    return res.status(403).json({
      message:     "Email non vérifié. Un nouveau code vient d'être envoyé.",
      needsVerify: true,
      email:       user.email,
      emailSent:   codeResult.success,
    });
  }

  const token = signToken({ id: user._id });
  console.log(`✅ Connexion : ${user.name} (${user.email}) — rôle: ${user.role}`);
  res.json({ token, user });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.json({ user });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    name, phone, university, specialty,
    bio, education, experience, skills, languages, socialLinks, cv,
  } = req.body;

  const updateData = {
    name, phone, university, specialty, bio, education, experience, skills, languages, socialLinks,
  };
  if (cv !== undefined) updateData.cv = cv;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).lean();

  res.json({ user });
});

// POST /api/auth/profile/cv
export const uploadProfileCV = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error("Aucun fichier reçu");
    err.statusCode = 400;
    throw err;
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { cv: { fileName: req.file.originalname, fileUrl } },
    { new: true, runValidators: true }
  ).lean();

  res.json({ user });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  console.log(`👋 Déconnexion : ${req.user?.name || "utilisateur inconnu"}`);
  res.json({ message: "Déconnecté avec succès" });
});

// PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const err = new Error("Mot de passe actuel et nouveau mot de passe requis");
    err.statusCode = 400;
    throw err;
  }

  if (newPassword.length < 6) {
    const err = new Error("Le nouveau mot de passe doit contenir au moins 6 caractères");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 404;
    throw err;
  }

  const match = await user.comparePassword(currentPassword);
  if (!match) {
    const err = new Error("Mot de passe actuel incorrect");
    err.statusCode = 401;
    throw err;
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Mot de passe modifié avec succès" });
});

// PUT /api/auth/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const { notifications, privacy, ai, internshipPreferences } = req.body;

  const $set = {};
  if (notifications)        $set["settings.notifications"]        = notifications;
  if (privacy)              $set["settings.privacy"]              = privacy;
  if (ai)                   $set["settings.ai"]                   = ai;
  if (internshipPreferences) $set["settings.internshipPreferences"] = internshipPreferences;

  if (Object.keys($set).length === 0) {
    const err = new Error("Aucun paramètre à mettre à jour");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set },
    { new: true, runValidators: true }
  ).lean();

  res.json({ user });
});

// DELETE /api/auth/account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    const err = new Error("Mot de passe requis pour confirmer la suppression");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 404;
    throw err;
  }

  const match = await user.comparePassword(password);
  if (!match) {
    const err = new Error("Mot de passe incorrect");
    err.statusCode = 401;
    throw err;
  }

  await User.findByIdAndDelete(req.user._id);
  console.log(`🗑️  Compte supprimé : ${user.email}`);
  res.json({ message: "Compte supprimé définitivement" });
});