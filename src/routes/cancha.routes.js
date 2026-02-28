import { Router } from "express";
import {
    authenticate
} from "../middlewares/auth.js"
import {
    canchaValidation,
} from "../middlewares/validator.js";
import {
    registerCancha,
    obtenerCancha,
    updateCancha,
    deleteCancha
} from "../controllers/cancha.controller.js"

const router = Router();

router.post("/register",authenticate,canchaValidation(),registerCancha);
router.get("/:id",authenticate,obtenerCancha);
router.put("/update/:id",authenticate,updateCancha);
router.delete("/:id",authenticate,deleteCancha);

export default router;