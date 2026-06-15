import User from "../models/users.models.js";
import { signToken } from "../middleware/auth.middleware.js";

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, university, specialty } = req.body;

    // Vérification des champs obligatoires
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nom, email et mot de passe requis." });
    }

    // Vérifier si l'email existe déjà
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      university,
      specialty,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user,
    });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // select("+password") car select:false dans le model
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Compte désactivé." });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON(), // password exclu automatiquement
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

// ─── GET ME (profil connecté) ─────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
};