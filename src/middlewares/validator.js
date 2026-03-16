import { check, param, validationResult } from "express-validator";
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

const registerValidation = [
  check("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre de usuario debe tener entre 3 y 30 carácteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "El nombre de usuario solo debe contener letras, números y barra bajas",
    )
    .custom(async (username) => {
      const user = await User.findOne({ username });
      if (user) throw new Error("El usuario ya existe");
    }),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Por favor ingrese un correo")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error("El usuario ya existe");
    }),
  check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener por lo menos 6 carácteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener por lo menos letras, números y simbolos",
    ),
  handleValidationErrors,
];

const loginValidation = [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Por favor ingrese un correo válido")
    .normalizeEmail(),
  check("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const verifyEmailValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email es requerido")
    .trim()
    .isEmail()
    .withMessage("Por favor coloque un correo valido")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user && user.emailVerified) {
        throw new Error("El usuario ya está verificado");
      }
    })
    .normalizeEmail(),
  check("code")
    .notEmpty()
    .withMessage("Código de verificación es necesario")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Código de verificación debe tener 6 dígitos")
    .isNumeric()
    .withMessage("Código de verificación debe contener solo números"),
  handleValidationErrors,
];

const crearProductoValidator = [
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("precio", "El precio no puede ser negativo").isFloat({ min: 0 }),
  check("categoria")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isMongoId()
    .withMessage("ID de categoría no valido"),
  check("stock", "El stock no puede ser menor a 0").isFloat({ min: 0 }),
  handleValidationErrors,
];

const actualizarProductoValidator = [
  param("id").isMongoId().withMessage("ID de producto no válido"),
  check("precio", "El precio no puede ser negativo").isFloat({ min: 0 }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("categoria")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isMongoId()
    .withMessage("No es un ID de Mongo válido"),
  check("stock", "El stock no puede ser menor a 0").isFloat({ min: 0 }),
  handleValidationErrors,
];

const existeCategoriaPorId = async (id, { req }) => {
  const existeCategoria = await Categoria.findById(id);
  if (!existeCategoria) {
    throw new Error(`El ID ${id} NO existe`);
  }

  if (req.categoria && !existeCategoria.estado) {
    throw new Error(`La Categoria ${existeCategoria.nombre} está inactiva`);
  }
};

const agregarItemCartValidation = () => [
  check("productoId")
    .isMongoId()
    .withMessage("ID no válido")
    .custom(async (id, { req }) => {
      const producto = await Producto.findById(id);

      if (!producto) throw new Error("El producto no existe");
      if (producto.stock <= 0) throw new Error("Producto no disponible");

      req.productoEncontrado = producto;
      return true;
    }),
  check("cantidad")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser mayor a 0")
    .custom(async (cantidad, { req }) => {
      const producto = await Producto.findById(req.body.productoId);
      if (producto && cantidad > producto.stock) {
        throw new Error(
          `Stock insuficiente. Solo quedan ${producto.stock} unidades`,
        );
      }
      return true;
    }),
  handleValidationErrors,
];

const reservaValidation = () => [
  check("cancha").isMongoId().withMessage("La id de la cancha debe ser valida"),
  check("senia").isNumeric().withMessage("La seña debe ser numérica"),
  check("fecha")
    .matches(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
    )
    .withMessage("El formato de la fecha no esvalido"),
  check("horas")
    .isNumeric()
    .withMessage("La cantidad de horas reservadas debe ser numérica"),
  handleValidationErrors,
];

const contactoValidation = [
  check("nombre")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("El nombre de usuario debe tener entre 5 y 30 carácteres"),
  check("contacto")
    .trim()
    .isEmail()
    .withMessage("Por favor ingrese un correo válido")
    .normalizeEmail(),
  check("descripcion")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("El mensaje debe tener entre 5 y 30 carácteres"),
  handleValidationErrors,
];

const canchaValidation = () => [
  check("descripcion")
    .notEmpty()
    .withMessage("La descripción de la cancha es obligatoria"),
  check("precio")
    .isNumeric()
    .withMessage("El valor de alquiler de la cancha debe ser numérico"),
  handleValidationErrors,
];

export {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  crearProductoValidator,
  actualizarProductoValidator,
  existeCategoriaPorId,
  agregarItemCartValidation,
  reservaValidation,
  contactoValidation,
  canchaValidation,
};
