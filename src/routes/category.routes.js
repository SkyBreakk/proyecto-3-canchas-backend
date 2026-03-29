import { Router } from "express";
import { check } from "express-validator";
import { authenticate, validarRol } from "../middlewares/auth.js";
import {
  existeCategoriaPorId,
  handleValidationErrors,
} from "../middlewares/validator.js";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  traerCategoriasPaginado,
} from "../controllers/category.controller.js";
const router = Router();

router.get("/", traerCategoriasPaginado);
router.post(
  "/",
  [
    authenticate,
    validarRol,
    check("nombre", "El nombre es obligatorio").notEmpty(),
    handleValidationErrors,
  ],
  crearCategoria,
);
router.put(
  "/:id",
  [
    authenticate,
    validarRol,
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
    validarRol,
    check("id", "El id no es válido").isMongoId(),
    check("id").custom(existeCategoriaPorId),
    handleValidationErrors,
  ],
  eliminarCategoria,
);

export default router;
