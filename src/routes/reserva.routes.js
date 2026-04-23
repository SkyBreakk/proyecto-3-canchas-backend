import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import {
  validarContacto,
  validarRemoverReserva,
  validarReserva,
} from "../middlewares/validator.js";
import {
  registrarReserva,
  removerReserva,
  obtenerReservasActivas,
  contactoReserva,
  obtenerReservasPorUsuario,
  actualizarPagoDeReserva,
  obtenerHorariosPorFecha,
} from "../controllers/reserva.controller.js";

const router = Router();

router.get("/all", [authenticate, validarRol], obtenerReservasActivas);
router.get("/mis-reservas", authenticate, obtenerReservasPorUsuario);
router.post("/horarios/:id", obtenerHorariosPorFecha);
router.post("/register", authenticate, validarReserva(), registrarReserva);
router.put("/:id/pago", [authenticate, validarRol], actualizarPagoDeReserva);
router.delete("/:id", [authenticate, ...validarRemoverReserva], removerReserva);

router.post("/contacto", ...validarContacto, contactoReserva);
export default router;
