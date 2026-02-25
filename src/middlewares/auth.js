import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // pregunto si viene un token
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "La autenticación es requerida. Por favor envia un token",
      });
    }
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      ok: false,
      message: "Token invalido o que ya está expirado ⛔",
    });
  }
};
