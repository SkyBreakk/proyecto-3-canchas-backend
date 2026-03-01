import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";

import canchaRoutes from "./routes/cancha.routes.js";
import reservaRoutes from "./routes/reserva.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:9500",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/cancha", canchaRoutes);
app.use("/api/reserva", reservaRoutes);

export default app;
