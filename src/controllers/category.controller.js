import { request, response } from "express";
import Categoria from "../models/Category.js";

const traerCategorias = async (req = request, res) => {
  const categorias = await Categoria.find({ estado: true }).populate(
    "usuario",
    "username email",
  );
  const total = await Categoria.countDocuments({ estado: true });

  res.json({
    total,
    categorias,
  });
};

const crearCategoria = async (req, res) => {
  try {
    if (!req.body.nombre) {
      return res
        .status(400)
        .json({ ok: false, message: "El nombre es requerido" });
    }

    const nombre = req.body.nombre.toUpperCase();
    const validarNombre = await Categoria.findOne({ nombre });

    if (validarNombre) {
      return res
        .status(400)
        .json({ ok: false, message: `La categoría ${nombre} ya existe` });
    }

    const usuario = req.user._id;
    const categoria = new Categoria({ nombre, usuario });
    await categoria.save();

    res.status(201).json({ ok: true, msg: "Categoría guardada", categoria });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body.nombre)
      return res.status(400).json({ ok: false, message: "Nombre requerido" });

    const nombre = req.body.nombre.toUpperCase();

    const nombreExiste = await Categoria.findOne({ nombre, _id: { $ne: id } });
    if (nombreExiste) {
      return res
        .status(400)
        .json({ ok: false, message: "Ese nombre ya está en uso" });
    }

    const categoria = await Categoria.findByIdAndUpdate(
      id,
      { nombre, usuario: req.user._id },
      { new: true },
    );

    if (!categoria)
      return res.status(404).json({ ok: false, message: "No encontrada" });

    res
      .status(200)
      .json({ ok: true, message: "Categoría actualizada", categoria });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al actualizar" });
  }
};

const eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  const categoriaBorrada = await Categoria.findByIdAndUpdate(
    id,
    {
      estado: false,
    },
    { new: true },
  );

  res.status(200).json({
    message: "Categoria eliminada",
    categoriaBorrada,
  });
};

const traerCategoriasPaginado = async (req, res) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, categorias] = await Promise.all([
    Categoria.countDocuments(query),
    Categoria.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("usuario", "username"),
  ]);

  res.json({
    total,
    categorias,
  });
};

export {
  traerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  traerCategoriasPaginado,
};
