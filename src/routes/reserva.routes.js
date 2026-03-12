import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import { reservaValidation } from "../middlewares/validator.js";
import {
  registerReserva,
  getReserva,
  deleteReserva,
  checkDisponibilidad,
} from "../controllers/reserva.controller.js";

const router = Router();

router.post("/register", authenticate, reservaValidation(), registerReserva);
router.post("/check/:id", checkDisponibilidad);
router.delete("/:id", authenticate, deleteReserva);

export default router;
