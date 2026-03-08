import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { createPayment } from "../controllers/payment.controller.js";

const router = Router();

router.post("/", authenticate, createPayment);

export default router;
