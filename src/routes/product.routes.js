import { Router } from "express";
import { check } from "express-validator";
import {
  handleValidationErrors,
  validarRol,
} from "../middlewares/validator.js";
import { authenticate } from "../middlewares/auth.js";
const router = Router();

import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  obtenerProducto,
} from "../controllers/product.controller.js";

router.get("/", obtenerProductos);
router.get("/:id", obtenerProducto);
router.post(
  "/",
  [
    authenticate,
    validarRol,
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("categoria")
      .notEmpty()
      .withMessage("La categoría es obligatoria")
      .isMongoId()
      .withMessage("No es un id de mongo válido"),

    handleValidationErrors,
  ],
  crearProducto,
);

router.put(
  "/:id",
  [
    authenticate,
    validarRol,
    check("id").isMongoId().withMessage("No es un id de mongo válido"),
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("categoria")
      .notEmpty()
      .withMessage("La categoría esobligatoria")
      .isMongoId()
      .withMessage("No es un id de mongo válido"),
    handleValidationErrors,
  ],
  actualizarProducto,
);

router.delete(
  "/:id",
  [
    authenticate,
    validarRol,
    check("id").isMongoId().withMessage("No es un id de mongo válido"),
    handleValidationErrors,
  ],
  borrarProducto,
);

export default router;