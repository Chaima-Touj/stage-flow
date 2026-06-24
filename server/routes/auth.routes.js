import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  verifyEmail,
  resendCode,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register",     register);
router.post("/login",        login);
router.post("/verify-email", verifyEmail);
router.post("/resend-code",  resendCode);
router.get("/me",            protect, getMe);
router.put("/profile",       protect, updateProfile);
router.post("/logout",       protect, logout);

export default router;