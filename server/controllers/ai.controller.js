import geminiService from "../services/gemini.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const chat = asyncHandler(async (req, res) => {
  const { messages, temperature } = req.body;
  if (!Array.isArray(messages)) {
    const err = new Error("messages array required");
    err.statusCode = 400;
    throw err;
  }
  const result = await geminiService.chat(messages, { temperature });
  res.json({ result });
});

export const recommendations = asyncHandler(async (req, res) => {
  const studentId = req.body.studentId || req.user._id;
  const limit = parseInt(req.body.limit, 10) || 5;
  const out = await geminiService.recommendInternships(studentId, limit);
  res.json(out);
});

export const analyzeCv = asyncHandler(async (req, res) => {
  const { text, fileUrl } = req.body;
  const out = await geminiService.analyzeCV({ text, fileUrl });
  res.json(out);
});

export const generateMotivation = asyncHandler(async (req, res) => {
  const studentId = req.body.studentId || req.user._id;
  const { offerId, tone } = req.body;
  if (!offerId) {
    const err = new Error("offerId required");
    err.statusCode = 400;
    throw err;
  }
  const out = await geminiService.generateMotivationLetter(studentId, offerId, { tone });
  res.json(out);
});
