import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
  verifyEmail,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
} from "../middlewares/validator.js";

import { authenticate } from "../middlewares/auth.js";
const router = Router();

router.post("/register", registerValidation(), register);
router.post("/login", loginValidation(), login);
router.post("/verify-email", verifyEmailValidation(), verifyEmail);

router.post("/logout", logout);
router.get("/profile", authenticate, getProfile);

export default router;