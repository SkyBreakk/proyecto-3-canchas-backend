import express from "express";

import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
// import { dbConnect } from "./config/db.js";

//import Rutas
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 4500;

//Middlewares
app.use(
  cors({
    origin: "http://localhost:9500",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

//Rutas
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log("🚀 Servidor en línea en puerto: " + PORT));
