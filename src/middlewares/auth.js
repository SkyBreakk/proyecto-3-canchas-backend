import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

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
    req.usuario = user._id.toString();
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      ok: false,
      message: "Token invalido o que ya está expirado ⛔",
    });
  }
};

export const validarRol = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      ok: false,
      message: "Usuario no autenticado",
    });
  }

  const rol = req.user.role;
  if (rol !== "admin") {
    return res.status(401).json({
      ok: false,
      message: "No tiene permisos para realizar la acción",
    });
  }
  next();
};

export const validarRolSuperAdmin = (req, res, next) => {
  const rol = req.user.role;
  if (rol !== "superadmin") {
    return res.status(403).json({
      ok: false,
      message:
        "No tiene permisos para realizar la acción, debes ser Superadmin",
    });
  }
  next();
};
