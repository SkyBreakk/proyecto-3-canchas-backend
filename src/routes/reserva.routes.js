import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import {
  contactoValidation,
  reservaValidation,
} from "../middlewares/validator.js";
import {
  registerReserva,
  getReserva,
  deleteReserva,
  checkDisponibilidad,
  getReservasDisponibles,
  contactoReserva,
} from "../controllers/reserva.controller.js";

const router = Router();

router.get("/all", [authenticate, validarRol], getReservasDisponibles);
router.post("/register", authenticate, reservaValidation(), registerReserva);
router.post("/check/:id", checkDisponibilidad);
router.delete("/:id", authenticate, deleteReserva);

router.post("/contacto", ...contactoValidation, contactoReserva);

export default router;
