import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { mongoSanitize } from "./middleware/sanitize.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import offersRoutes from "./routes/offers.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import interviewsRoutes from "./routes/interviews.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Sécurité HTTP headers ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Trop de tentatives, réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Protection NoSQL injection (compatible Express 5) ────────────────────────
app.use(mongoSanitize);

// ─── Uploads statiques ───────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "🚀 StageFlow API is running!" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",          authLimiter, authRoutes);
app.use("/api/offers",        apiLimiter,  offersRoutes);
app.use("/api/applications",  apiLimiter,  applicationsRoutes);
app.use("/api/messages",      apiLimiter,  messagesRoutes);
app.use("/api/notifications", apiLimiter,  notificationsRoutes);
app.use("/api/ai",            apiLimiter,  aiRoutes);
app.use("/api/favorites",     apiLimiter,  favoritesRoutes);
app.use("/api/interviews",    apiLimiter,  interviewsRoutes);

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Rejets non catchés ───────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("❌ UnhandledRejection:", err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("─────────────────────────────────────");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log("─────────────────────────────────────");
  });
});
