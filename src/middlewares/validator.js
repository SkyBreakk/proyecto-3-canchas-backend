import { body, check, param, validationResult } from "express-validator";
import User from "../models/User.js";
import Categoria from "../models/Category.js";
import Producto from "../models/Product.js";
import Cart from "../models/Cart.js";
import Reserva from "../models/Reserva.js";

const ManejarErroresDeValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: errors.array()[0].msg || "Error de validación",
      errors: errors.mapped(),
    });
  }
  next();
};

const validarRegistro = [
  check("username")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("El nombre de usuario debe tener entre 5 y 20 caracteres")
    .matches(/^[a-zA-Z0-9_\sáéíóúÁÉÍÓÚñÑ]+$/)
    .withMessage(
      "El nombre solo permite letras, números, espacios, guiones bajos y tildes",
    )
    .custom((value) => {
      if (/\s{2,}/.test(value)) {
        throw new Error("El nombre no puede tener múltiples espacios seguidos");
      }
      return true;
    })
    .custom(async (username, { req }) => {
      const user = await User.findOne({ username });
      if (user)
        throw new Error(
          "El usuario con este nombre ya existe. Pruebe usar otro",
        );
      return true;
    }),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Por favor ingrese un correo")
    .isLength({ max: 254 })
    .withMessage("El correo no puede superar los 254 caracteres")
    .normalizeEmail({
      gmail_remove_dots: false,
    })
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        if (!user.state) {
          throw new Error(
            "Esta cuenta está desactivada. Contacta a soporte para reactivarla",
          );
        } else if (!user.emailVerified) {
          throw new Error(
            "La cuenta está creada, pero no está verificada. Pruebe iniciando sesión",
          );
        } else {
          throw new Error("Esta cuenta ya existe. Pruebe iniciando sesión");
        }
      }
    }),
  check("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("La contraseña debe tener entre 6 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
    ),
  ManejarErroresDeValidacion,
];

const validarLogin = [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Por favor ingrese un correo válido")
    .normalizeEmail({
      gmail_remove_dots: false,
    }),
  check("password").notEmpty().withMessage("La contraseña es requerida"),
  ManejarErroresDeValidacion,
];

const validarActualizarPerfil = [
  check("username")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("El nombre de usuario debe tener entre 5 y 20 caracteres")
    .matches(/^[a-zA-Z0-9_\sáéíóúÁÉÍÓÚñÑ]+$/)
    .withMessage(
      "El nombre solo permite letras, números, espacios, guiones bajos y tildes",
    )
    .custom((value) => {
      if (/\s{2,}/.test(value)) {
        throw new Error("El nombre no puede tener múltiples espacios seguidos");
      }
      return true;
    })
    .custom(async (username, { req }) => {
      const user = await User.findOne({ username });
      if (user && user._id.toString() !== req.user._id.toString()) {
        throw new Error("El nombre de usuario ya está en uso");
      }
      return true;
    }),
  check("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Por favor ingrese un correo válido")
    .isLength({ max: 254 })
    .withMessage("El nuevo correo no puede superar los 254 caracteres")
    .normalizeEmail({ gmail_remove_dots: false })
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user._id.toString()) {
        throw new Error("Este correo ya está registrado por otro usuario");
      }
    }),
  check("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 6, max: 128 })
    .withMessage("La nueva contraseña debe tener entre 6 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
    ),
  ManejarErroresDeValidacion,
];

const verificarValidacionDeEmail = [
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
    .normalizeEmail({ gmail_remove_dots: false }),
  check("code")
    .notEmpty()
    .withMessage("Código de verificación es necesario")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Código de verificación debe tener 6 dígitos")
    .isNumeric()
    .withMessage("Código de verificación debe contener solo números"),
  ManejarErroresDeValidacion,
];

const validarCreacionDeProducto = [
  check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 5, max: 30 })
    .withMessage("El nombre del producto debe tener entre 5 y 30 carácteres"),
  check("precio")
    .isFloat({ min: 1 })
    .withMessage("El precio debe ser mayor que 0")
    .isFloat({ max: 3000000 })
    .withMessage("El precio máximo es $3.000.000"),
  check("categoria")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isMongoId()
    .withMessage("ID de categoría no valido"),
  check("stock")
    .isFloat({ min: 0 })
    .withMessage("El stock no puede ser menor a 0")
    .isFloat({ max: 100000 })
    .withMessage("El stock máximo es 100.000 unidades"),
  check("descripcion")
    .optional()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),
  ManejarErroresDeValidacion,
];

const validarActualizarProducto = [
  param("id").isMongoId().withMessage("ID de producto no válido"),
  check("precio")
    .isFloat({ min: 1 })
    .withMessage("El precio debe ser mayor que 0")
    .isFloat({ max: 3000000 })
    .withMessage("El precio máximo es $3.000.000"),
  check("nombre", "El nombre es obligatorio")
    .notEmpty()
    .isLength({ min: 5, max: 30 })
    .withMessage("El nombre del producto debe tener entre 5 y 30 carácteres"),
  check("categoria")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isMongoId()
    .withMessage("No es un ID de Mongo válido"),
  check("stock")
    .isFloat({ min: 0 })
    .withMessage("El stock no puede ser menor a 0")
    .isFloat({ max: 100000 })
    .withMessage("El stock máximo es 100.000 unidades"),
  check("descripcion")
    .optional()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),
  ManejarErroresDeValidacion,
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

const validarAgregarItemAlCarrito = () => [
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
  ManejarErroresDeValidacion,
];

const validarReserva = () => [
  check("cancha").isMongoId().withMessage("La ID de la cancha debe ser valida"),
  check("senia").isNumeric().withMessage("La seña debe ser numérica"),
  check("fecha")
    .matches(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
    )
    .withMessage("El formato de la fecha no esvalido"),
  check("horas")
    .isNumeric()
    .withMessage("La cantidad de horas reservadas debe ser numérica"),
  ManejarErroresDeValidacion,
];

const validarRemoverReserva = [
  param("id")
    .notEmpty()
    .withMessage("Debe proporcionar el ID de la reserva")
    .isMongoId()
    .withMessage("El ID de la reserva no es válido")
    .custom(async (id, { req }) => {
      const reserva = await Reserva.findById(id);
      if (!reserva) {
        throw new Error("La reserva no existe");
      }
      const usuario = req.user;
      if (
        usuario.role === "user" &&
        usuario._id.toString() !== reserva.usuario.toString()
      ) {
        throw new Error("No tienes permisos para cancelar esta reserva");
      }
      return true;
    }),
  ManejarErroresDeValidacion,
];

const validarContacto = [
  check("nombre")
    .trim()
    .isLength({ min: 5, max: 40 })
    .withMessage("El nombre debe tener entre 5 y 40 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .withMessage("El nombre solo debe contener letras y espacios"),
  check("contacto")
    .trim()
    .isEmail()
    .isLength({ max: 254 })
    .withMessage("El correo no puede superar los 254 caracteres")
    .withMessage("Por favor ingrese un correo válido")
    .normalizeEmail({
      gmail_remove_dots: false,
    }),
  check("descripcion")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("El mensaje debe tener entre 20 y 1000 caracteres"),

  ManejarErroresDeValidacion,
];

const validarCancha = () => [
  param("id").optional().isMongoId().withMessage("Debe aportar un ID valido"),
  check("nombre")
    .notEmpty()
    .withMessage("El nombre de la cancha es obligatorio")
    .trim()
    .isLength({ min: 5, max: 15 })
    .withMessage("El nombre debe tener entre 5 y 15 carácteres"),
  check("descripcion")
    .notEmpty()
    .withMessage("La descripción de la cancha es obligatoria")
    .isLength({ max: 30 })
    .withMessage("La descripción no puede exceder 30 caracteres"),
  check("precio")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isNumeric()
    .withMessage("El valor de alquiler de la cancha debe ser numérico")
    .isFloat({ min: 1 })
    .withMessage("El precio debe ser mayor que 0")
    .isFloat({ max: 3000000 })
    .withMessage("El precio no puede ser mayor que $3.000.000"),
  ManejarErroresDeValidacion,
];

const validarPago = [
  body("tipo")
    .notEmpty()
    .withMessage("El tipo de pago es obligatorio")
    .isIn(["directa", "carrito", "reserva"])
    .withMessage("Tipo de pago no válido"),
  body("id")
    .notEmpty()
    .withMessage("El ID de referencia es obligatorio")
    .isMongoId()
    .withMessage("El ID proporcionado no es un formato válido de MongoDB"),
  body("cantidad")
    .if(body("tipo").equals("directa"))
    .notEmpty()
    .withMessage("La cantidad es obligatoria para compras directas")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser un número entero mayor a 0"),
  ManejarErroresDeValidacion,
];

export {
  ManejarErroresDeValidacion,
  validarRegistro,
  validarLogin,
  validarActualizarPerfil,
  verificarValidacionDeEmail,
  validarCreacionDeProducto,
  validarActualizarProducto,
  existeCategoriaPorId,
  validarAgregarItemAlCarrito,
  validarReserva,
  validarRemoverReserva,
  validarContacto,
  validarCancha,
  validarPago,
};
