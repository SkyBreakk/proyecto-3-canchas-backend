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

const crearCategoria = async (req, res = response) => {
  const nombre = req.body.nombre.toUpperCase();
  const validarNombre = await Categoria.findOne({ nombre });

  if (validarNombre) {
    return res.status(400).json({
      msg: `La categoría ${nombre} ya existe`,
    });
  }

  const usuario = req.user._id;
  const categoria = new Categoria({ nombre, usuario });
  categoria.save();

  res.status(200).json({
    msg: "Categoría guardada",
    categoria,
  });
};

const actualizarCategoria = async (req = request, res = response) => {
  const { id } = req.params;

  const { nombre } = req.body;
  const validarNombre = await Categoria.findOne({
    nombre: nombre.toUpperCase(),
  });

  if (validarNombre) {
    return res.status(400).json({
      ok: false,
      message: "Ya existe una categoría con ese nombre",
    });
  }
  //------------------------------------
  const datos = {
    nombre: nombre.toUpperCase(),
    usuario: req.user._id,
  };

  const categoria = await Categoria.findByIdAndUpdate(id, datos, { new: true });

  res.status(200).json({
    message: "Categoria actualizada",
    categoria,
  });
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
      .populate("usuario", "username")
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
  traerCategoriasPaginado
};
