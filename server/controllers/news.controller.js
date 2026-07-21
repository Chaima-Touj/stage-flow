import News from "../models/news.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/news?limit=3 — public, triée par date de publication décroissante.
export const getAllNews = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 0;
  let query = News.find().sort({ publishedAt: -1 }).select("-__v");
  if (limit > 0) query = query.limit(limit);
  const news = await query;
  res.json(news);
});

export const getNewsById = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id).select("-__v");
  if (!article) return res.status(404).json({ message: "Actualité introuvable." });
  res.json(article);
});

/* ── POST /api/news ───────────────────────────────────────────────────────────
   Réservé admin. L'image est obligatoire à la création (uploadée via multer,
   voir upload.middleware.js#uploadNewsImage). */
export const createNews = asyncHandler(async (req, res) => {
  const { title, excerpt, content, category, publishedAt } = req.body;

  if (!title || !excerpt || !category) {
    const err = new Error("Champs requis manquants : title, excerpt, category.");
    err.statusCode = 400;
    throw err;
  }
  if (!req.file) {
    const err = new Error("Une image est requise.");
    err.statusCode = 400;
    throw err;
  }

  const image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  const article = await News.create({
    title,
    excerpt,
    content: content || "",
    category,
    image,
    author: req.user?.name || "admin",
    publishedAt: publishedAt || Date.now(),
  });

  res.status(201).json(article);
});

/* ── PUT /api/news/:id ─────────────────────────────────────────────────────────
   Réservé admin. Nouvelle image optionnelle : sans fichier envoyé, l'image
   existante est conservée. */
export const updateNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) {
    const err = new Error("Actualité introuvable.");
    err.statusCode = 404;
    throw err;
  }

  const { title, excerpt, content, category, publishedAt } = req.body;

  if (title !== undefined)       article.title = title;
  if (excerpt !== undefined)     article.excerpt = excerpt;
  if (content !== undefined)     article.content = content;
  if (category !== undefined)    article.category = category;
  if (publishedAt !== undefined) article.publishedAt = publishedAt;
  if (req.file) {
    article.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }

  await article.save();
  res.json(article);
});

export const deleteNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) {
    const err = new Error("Actualité introuvable.");
    err.statusCode = 404;
    throw err;
  }
  await article.deleteOne();
  res.json({ message: "Actualité supprimée.", id: article._id });
});
