import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import { reservaValidation } from "../middlewares/validator.js";
import {
  registerReserva,
  deleteReserva,
  checkDisponibilidad,
  getReservasDisponibles,
  getReservasPorUsuario,
  updatePagoReserva,
} from "../controllers/reserva.controller.js";

const router = Router();

router.get("/all", [authenticate, validarRol], getReservasDisponibles);
router.post("/register", authenticate, reservaValidation(), registerReserva);
router.post("/check/:id", checkDisponibilidad);
router.delete("/:id", authenticate, deleteReserva);
router.get("/mis-reservas", authenticate, getReservasPorUsuario);
router.put("/:id/pago", [authenticate, validarRol], updatePagoReserva);
export default router;
