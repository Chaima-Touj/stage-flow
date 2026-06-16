import groqService from "../services/groq.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/ai/chat
export const chat = asyncHandler(async (req, res) => {
  const { messages, temperature } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    const err = new Error("messages array requis");
    err.statusCode = 400;
    throw err;
  }

  const result = await groqService.chat(messages, { temperature });
  res.json({ result });
});

// POST /api/ai/recommendations
export const recommendations = asyncHandler(async (req, res) => {
  const studentId = req.body.studentId || req.user._id;
  const limit     = parseInt(req.body.limit, 10) || 5;
  const out       = await groqService.recommendInternships(studentId, limit);
  res.json(out);
});

// POST /api/ai/analyze-cv
export const analyzeCv = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const out = await groqService.analyzeCV({ text });
  res.json(out);
});

// POST /api/ai/generate-motivation
export const generateMotivation = asyncHandler(async (req, res) => {
  const studentId = req.body.studentId || req.user._id;
  const { offerId, tone } = req.body;

  if (!offerId) {
    const err = new Error("offerId requis");
    err.statusCode = 400;
    throw err;
  }

  const out = await groqService.generateMotivationLetter(studentId, offerId, { tone });
  res.json(out);
});
