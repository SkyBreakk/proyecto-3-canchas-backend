import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import { canchaValidation } from "../middlewares/validator.js";
import {
  registerCancha,
  obtenerCancha,
  obtenerCanchasDisponibles,
  updateCancha,
  deleteCancha,
} from "../controllers/cancha.controller.js";

const router = Router();

router.get("/:id", obtenerCancha);
router.get("/", obtenerCanchasDisponibles);
router.post(
  "/register",
  [authenticate, validarRol, ...canchaValidation()],
  registerCancha,
);
router.put("/update/:id", [authenticate, validarRol], updateCancha);
router.delete("/:id", [authenticate, validarRol], deleteCancha);

export default router;
