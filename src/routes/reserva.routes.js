import { Router } from "express";
import {
    authenticate
} from "../middlewares/auth.js"
import {
    reservaValidation
} from "../middlewares/validator.js";
import {
    registerReserva,
    getReserva,
    deleteReserva
} from "../controllers/reserva.controller.js"

const router = Router();

router.post("/register", authenticate, reservaValidation(), registerReserva);
router.get("/:id", authenticate, getReserva);
router.delete("/:id", authenticate, deleteReserva);

export default router;