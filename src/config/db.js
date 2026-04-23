import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const dbConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (error) {
    throw new Error(`Error de conexión a MongoDB: ${error.message}`);
  }
};
