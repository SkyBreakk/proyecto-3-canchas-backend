import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { canchaValidation } from "../middlewares/validator.js";
import {
  registerCancha,
  obtenerCancha,
  obtenerCanchasDisponibles,
  updateCancha,
  deleteCancha,
} from "../controllers/cancha.controller.js";

const router = Router();

router.get("/:id", authenticate, obtenerCancha);
router.get("/", authenticate, obtenerCanchasDisponibles);
router.post("/register", authenticate, ...canchaValidation(), registerCancha);
router.put("/update/:id", authenticate, updateCancha);
router.delete("/:id", authenticate, deleteCancha);

export default router;
