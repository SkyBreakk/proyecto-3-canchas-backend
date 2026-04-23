import { Router } from "express";
import {
  obtenerPerfil,
  login,
  registro,
  verificarEmail,
  loginConGoogle,
  obtenerUsuarios,
  desactivarUsuario,
  actualizarPerfil,
  otorgarRolAdmin,
  removerRolAdmin,
  reenviarCodigoDeVerificacion,
} from "../controllers/auth.controller.js";
import {
  ManejarErroresDeValidacion,
  validarLogin,
  validarRegistro,
  validarActualizarPerfil,
  verificarValidacionDeEmail,
} from "../middlewares/validator.js";
import {
  authenticate,
  validarRol,
  validarRolSuperAdmin,
} from "../middlewares/auth.js";
import { check } from "express-validator";
import User from "../models/User.js";
const router = Router();

router.post("/register", ...validarRegistro, registro);
router.post("/login", ...validarLogin, login);
router.post("/verify-email", ...verificarValidacionDeEmail, verificarEmail);
router.post(
  "/resend-code",
  [
    check("email")
      .notEmpty()
      .withMessage("Email es requerido")
      .trim()
      .isEmail()
      .withMessage("Por favor coloque un correo valido")
      .custom(async (email) => {
        const user = await User.findOne({ email });
        if (user && user.emailVerified) {
          throw new Error("El usuario ya está verificado");
        }
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    ManejarErroresDeValidacion,
  ],
  reenviarCodigoDeVerificacion,
);
router.post("/google", loginConGoogle);

router.get("/", [authenticate, validarRol], obtenerUsuarios);
router.delete("/:id", [authenticate, validarRol], desactivarUsuario);
router.post("/logout", authenticate, (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      path: "/",
    });

    return res
      .status(200)
      .json({ ok: true, message: "Sesión cerrada exitosamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: "Error al intentar cerrar sesión" });
  }
});
router.get("/profile", authenticate, obtenerPerfil);
router.put(
  "/update-profile",
  [authenticate, ...validarActualizarPerfil],
  actualizarPerfil,
);
router.put("/admin", [authenticate, validarRolSuperAdmin], otorgarRolAdmin);
router.delete(
  "/admin/:id",
  [authenticate, validarRolSuperAdmin],
  removerRolAdmin,
);

export default router;
