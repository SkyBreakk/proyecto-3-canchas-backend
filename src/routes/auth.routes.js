import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  getProfile,
  getUsersPaginado,
  deleteUser
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
} from "../middlewares/validator.js";
import {
  authenticate,
  validarRol
} from "../middlewares/auth.js";
const router = Router();

router.get("/prueba", (req, res) => {
  res.send("Aplicación funcionando");
});
router.post("/register", ...registerValidation, register);
router.post("/login", ...loginValidation, login);
router.post("/verify-email", ...verifyEmailValidation, verifyEmail);

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
router.delete("/:id", [authenticate, validarRol], deleteUser);
router.get("/", [authenticate, validarRol], getUsersPaginado);

export default router;
