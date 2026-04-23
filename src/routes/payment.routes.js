import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { crearPago } from "../controllers/payment.controller.js";
import { validarPago } from "../middlewares/validator.js";

const router = Router();

router.post("/", [authenticate, ...validarPago], crearPago);

export default router;
