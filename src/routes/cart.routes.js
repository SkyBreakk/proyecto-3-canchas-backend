import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { agregarItemCartValidation } from "../middlewares/validator.js";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/add", [authenticate], addToCart);
router.put("/:productoId", authenticate, updateCartItem);
router.delete("/:productoId", [authenticate], removeFromCart);
router.delete("/", authenticate, clearCart);

export default router;