import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import { validarCancha } from "../middlewares/validator.js";
import {
  registrarCancha,
  obtenerCanchasDisponibles,
  actualizarCancha,
  removerCancha,
} from "../controllers/cancha.controller.js";

const router = Router();

router.get("/", obtenerCanchasDisponibles);
router.post(
  "/register",
  [authenticate, validarRol, ...validarCancha()],
  registrarCancha,
);
router.put(
  "/update/:id",
  [authenticate, validarRol, ...validarCancha()],
  actualizarCancha,
);
router.delete("/:id", [authenticate, validarRol], removerCancha);

export default router;
