import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
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

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "🚀 StageFlow API is running!" });
});

app.use("/api/auth",          authRoutes);
app.use("/api/offers",        offersRoutes);
app.use("/api/applications",  applicationsRoutes);
app.use("/api/messages",      messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/ai",            aiRoutes);
app.use("/api/favorites",     favoritesRoutes);
app.use("/api/interviews",    interviewsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("─────────────────────────────────────");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log("─────────────────────────────────────");
  });
});
