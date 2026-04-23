import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  obtenerCarrito,
  agregarAlCarrito,
  removerDelCarrito,
  actualizarCantidadDeItem,
  limpiarCarrito,
} from "../controllers/cart.controller.js";
import { validarAgregarItemAlCarrito } from "../middlewares/validator.js";

const router = Router();

router.get("/", authenticate, obtenerCarrito);
router.post(
  "/add",
  [authenticate, ...validarAgregarItemAlCarrito()],
  agregarAlCarrito,
);
router.put(
  "/:productoId",
  [authenticate, ...validarAgregarItemAlCarrito()],
  actualizarCantidadDeItem,
);
router.delete("/:productoId", [authenticate], removerDelCarrito);
router.delete("/", authenticate, limpiarCarrito);

export default router;
