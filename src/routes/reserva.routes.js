import { Router } from "express";
import { authenticate, validarRol } from "../middlewares/auth.js";
import { reservaValidation } from "../middlewares/validator.js";
import {
  registerReserva, 
  checkDisponibilidad, 
  getReserva,
  deleteReserva,
  getReservasDisponibles
} from "../controllers/reserva.controller.js";

const router = Router();

router.get("/",authenticate,getReservasDisponibles);
router.post("/register", authenticate, reservaValidation(), registerReserva);
router.post("/check/:id", checkDisponibilidad);
router.delete("/:id", authenticate, deleteReserva);
router.get("/:id",authenticate,getReserva);

export default router;
