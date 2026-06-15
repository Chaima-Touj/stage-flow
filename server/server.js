import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Middlewares globaux ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Mounting routes ──────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Route de base ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🚀 StageFlow API is running!" });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("─────────────────────────────────────");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log("─────────────────────────────────────");
  });
});