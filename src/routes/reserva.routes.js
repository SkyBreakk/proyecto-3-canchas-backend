import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import {
  contactoValidation,
  reservaValidation,
} from "../middlewares/validator.js";
import {
  registerReserva,
  deleteReserva,
  checkDisponibilidad,
  getReservasDisponibles,
  contactoReserva,
  getReservasPorUsuario,
  updatePagoReserva,
} from "../controllers/reserva.controller.js";

const router = Router();

router.get("/all", [authenticate, validarRol], getReservasDisponibles);
router.get("/mis-reservas", authenticate, getReservasPorUsuario);
router.post("/register", authenticate, reservaValidation(), registerReserva);
router.post("/check/:id", checkDisponibilidad);
router.put("/:id/pago", [authenticate, validarRol], updatePagoReserva);
router.delete("/:id", authenticate, deleteReserva);

router.post("/contacto", ...contactoValidation, contactoReserva);
export default router;
