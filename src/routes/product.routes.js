import { Router } from "express";
import { check } from "express-validator";
import {
  validarActualizarProducto,
  validarCreacionDeProducto,
  existeCategoriaPorId,
  ManejarErroresDeValidacion,
} from "../middlewares/validator.js";
import { authenticate, validarRol } from "../middlewares/auth.js";
const router = Router();

import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  removerProducto,
  obtenerProducto,
} from "../controllers/product.controller.js";

router.get("/", obtenerProductos);
router.get("/:id", obtenerProducto);
router.post(
  "/",
  [
    authenticate,
    validarRol,
    ...validarCreacionDeProducto,
    check("categoria").custom(existeCategoriaPorId),
    ManejarErroresDeValidacion,
  ],
  crearProducto,
);

router.put(
  "/:id",
  [
    authenticate,
    validarRol,
    ...validarActualizarProducto,
    check("categoria").custom(existeCategoriaPorId),
    ManejarErroresDeValidacion,
  ],
  actualizarProducto,
);

router.delete(
  "/:id",
  [
    authenticate,
    validarRol,
    check("id").isMongoId().withMessage("No es un id de mongo válido"),
    ManejarErroresDeValidacion,
  ],
  removerProducto,
);

export default router;
