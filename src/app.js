import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

//import Rutas
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
// import searchRoutes from "./routes/search.routes.js";

const app = express();

//Middlewares
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

//Rutas
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
// app.use("/api/search", searchRoutes);

export default app;
