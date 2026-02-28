import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  existeCategoriaPorId,
  handleValidationErrors,
} from "../middlewares/validator.js";
import {
  actualizarCategoria,
  crearCategoria,
  traerCategorias,
  eliminarCategoria,
} from "../controllers/category.controller.js";
const router = Router();

router.get("/", authenticate, traerCategorias);
router.post(
  "/",
  [
    authenticate,
    check("nombre", "El nombre es obligatorio").notEmpty(),
    handleValidationErrors,
  ],
  crearCategoria,
);
router.put(
  "/:id",
  [
    authenticate,
    check("id", "El id es requerido y debe ser válido").isMongoId(),
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("id").custom(existeCategoriaPorId),
    handleValidationErrors,
  ],
  actualizarCategoria,
);
router.delete(
  "/:id",
  [
    authenticate,
    check("id", "El id no es válido").isMongoId(),
    check("id").custom(existeCategoriaPorId),
    handleValidationErrors,
  ],
  eliminarCategoria,
);

export default router;