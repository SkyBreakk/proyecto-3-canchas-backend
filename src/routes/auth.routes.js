import { Router } from "express";
import {
  getProfile,
  login,
  register,
  verifyEmail,
  getUserByEmail,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
} from "../middlewares/validator.js";
import { authenticate } from "../middlewares/auth.js";
const router = Router();

//RUTAS PUBLICAS
router.get("/prueba", (req, res) => {
  res.send("Aplicación funcionando");
});
router.post("/register", ...registerValidation, register);
router.post("/login", ...loginValidation, login);
router.post("/verify-email", ...verifyEmailValidation, verifyEmail);

//RUTAS PRIVADAS
router.post("/logout", authenticate, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return res
    .status(200)
    .json({ ok: true, message: "Sesión cerrada exitosamente" });
});
router.get("/profile", authenticate, getProfile);
router.get("/user/:email", getUserByEmail);

export default router;
