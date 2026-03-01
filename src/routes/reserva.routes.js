import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import {
  registerReserva,
  getReserva,
  deleteReserva,
} from "../controllers/reserva.controller.js";

const router = Router();

router.post("/register", authenticate, registerReserva);
router.get("/:id", authenticate, getReserva);
router.delete("/:id", [authenticate, validarRol], deleteReserva);

export default router;
