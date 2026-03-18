import { Router } from "express";
import {
  getProfile,
  login,
  register,
  verifyEmail,
  loginWithGoogle,
  getUsersPaginado,
  deleteUser,
  updateProfile,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
} from "../middlewares/validator.js";
import { authenticate, validarRol } from "../middlewares/auth.js";
const router = Router();

//RUTAS PUBLICAS
router.post("/register", ...registerValidation, register);
router.post("/login", ...loginValidation, login);
router.post("/verify-email", ...verifyEmailValidation, verifyEmail);
router.post("/google", loginWithGoogle);

//RUTAS PRIVADAS
router.get("/", [authenticate, validarRol], getUsersPaginado);
router.delete("/:id", [authenticate, validarRol], deleteUser);
router.post("/logout", authenticate, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/",
  });

  return res
    .status(200)
    .json({ ok: true, message: "Sesión cerrada exitosamente" });
});
router.get("/profile", authenticate, getProfile);
router.put("/update-profile", authenticate, updateProfile);

export default router;
