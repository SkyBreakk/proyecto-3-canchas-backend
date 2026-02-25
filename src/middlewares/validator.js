import { check, validationResult } from "express-validator";
import User from "../models/User.js";
import Categoria from "../models/Category.js";
import Producto from "../models/Product.js";
import Cart from "../models/Cart.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.mapped(),
    });
  }
  next();
};

const registerValidation = () => [
  check("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom(async (value) => {
      const user = await User.findOne({ value });
      if (user && user.username === value) {
        throw new Error("El usuario ya existe");
      }
    }),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (value) => {
      const user = await User.findOne({ value });
      if (user) {
        throw new Error("El usuario ya existe");
      }
    })
    .normalizeEmail(),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  handleValidationErrors,
];

const loginValidation = () => [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  check("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const verifyEmailValidation = () => [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user && user.emailVerified) {
        throw new Error("El usuario ya está verificado");
      }
    })
    .normalizeEmail(),
  check("code")
    .notEmpty()
    .withMessage("Verification code is required")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must be numeric"),
  handleValidationErrors,
];

const existeCategoriaPorId = async (id) => {
  const existeCategoria = await Categoria.findById(id);
  if (!existeCategoria) {
    throw new Error(`El id ${id} NO existe`);
  }

  if (!existeCategoria.estado) {
    throw new Error(`La Categoria ${existeCategoria.nombre} está inactiva`);
  }
};

const validarRol = (req, res, next) => {
  const rol = req.user.role;
  if (rol !== "admin") {
    return res.status(401).json({
      ok: false,
      message: "No tiene permisos para realizar la acción",
    });
  }
  next();
};

const validarIdProducto = async (id) => {
  const producto = await Producto.findById(id);
  if (producto) {
    throw new Error("Producto ya existe");
  }
};

const validarProductoParaCarrito = async (productoId) => {
  const producto = await Producto.findById(productoId);

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  if (!producto.disponible) {
    return res.status(400).json({ error: "Producto no disponible" });
  }
};

const validarCart = async (req, res, next) => {
  console.log(req.user);
  let cart = await Cart.findOne({ usuario: req.user.id });
  //si carrito no existe
  if (!cart) {
    return res
      .status(400)
      .json({ ok: false, message: "Carrito no encontrado" });
  } else {
    req.cart = cart;
  }
  next();
};

// 4 - Validación para agregar item al carrito----------------------------------
const agregarItemCartValidation = () => [
  check("productoId")
    .notEmpty()
    .withMessage("Debe proporcionar productoId")

    .custom(async (value) => {
      const producto = await Producto.findById(value);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      if (!producto.disponible) {
        throw new Error("Producto no disponible");
      }
    }),
  check("cantidad")
    .notEmpty()
    .withMessage("Debe proporcionar cantidad")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser mayor que 0"),
  handleValidationErrors,
];

export {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  handleValidationErrors,
  existeCategoriaPorId,
  validarRol,
  validarIdProducto,
  validarCart,
  agregarItemCartValidation,
  validarProductoParaCarrito,
};
