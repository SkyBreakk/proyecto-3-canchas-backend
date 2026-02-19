import { Router } from "express";

const router = Router();

// Rutas
router.get("/prueba", (req, res) => {
  res.send("Aplicación funcionando");
});

export default router;
