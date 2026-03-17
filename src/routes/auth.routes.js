import { Router } from "express";
import {
  getProfile,
  login,
  register,
  verifyEmail,
  getUserByEmail,
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
router.get("/user/:email", getUserByEmail);

//RUTAS PRIVADAS
router.get("/", [authenticate, validarRol], getUsersPaginado);
router.delete("/:id", [authenticate, validarRol], deleteUser);
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
router.put("/update-profile", authenticate, updateProfile);

export default router;
