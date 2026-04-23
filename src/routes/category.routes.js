import { Router } from "express";
import { check } from "express-validator";
import { authenticate, validarRol } from "../middlewares/auth.js";
import {
  existeCategoriaPorId,
  ManejarErroresDeValidacion,
} from "../middlewares/validator.js";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  traerCategorias,
} from "../controllers/category.controller.js";
const router = Router();

router.get("/", traerCategorias);
router.post(
  "/",
  [
    authenticate,
    validarRol,
    check("nombre")
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 4, max: 20 })
      .withMessage(
        "El nombre de la categoria debe tener entre 4 y 20 carácteres",
      ),
    ManejarErroresDeValidacion,
  ],
  crearCategoria,
);
router.put(
  "/:id",
  [
    authenticate,
    validarRol,
    check("id", "El id es requerido y debe ser válido").isMongoId(),
    check("nombre")
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 4, max: 20 })
      .withMessage(
        "El nombre de la categoria debe tener entre 4 y 20 carácteres",
      ),
    check("id").custom(existeCategoriaPorId),
    ManejarErroresDeValidacion,
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
    ManejarErroresDeValidacion,
  ],
  eliminarCategoria,
);

export default router;
