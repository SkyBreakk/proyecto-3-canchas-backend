import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const dbConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅Base de datos conectada");
  } catch (error) {
    console.error("❌Error de conexión", error);
  }
};
