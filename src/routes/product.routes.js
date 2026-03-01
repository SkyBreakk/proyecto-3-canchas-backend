import { Router } from "express";
import { check } from "express-validator";
import {
  actualizarProductoValidator,
  crearProductoValidator,
  existeCategoriaPorId,
  handleValidationErrors,
} from "../middlewares/validator.js";
import { authenticate, validarRol } from "../middlewares/auth.js";
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
    ...crearProductoValidator,
    check("categoria").custom(existeCategoriaPorId),
    handleValidationErrors,
  ],
  crearProducto,
);

router.put(
  "/:id",
  [
    authenticate,
    validarRol,
    ...actualizarProductoValidator,
    check("categoria").custom(existeCategoriaPorId),
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
