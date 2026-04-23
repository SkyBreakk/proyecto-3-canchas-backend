import Categoria from "../models/Category.js";

const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res
        .status(400)
        .json({ ok: false, message: "El nombre es requerido" });
    }

    const nombreMayus = req.body.nombre.toUpperCase();
    const categoriaExistente = await Categoria.findOne({ nombre: nombreMayus });
    if (categoriaExistente) {
      return res
        .status(400)
        .json({ ok: false, message: `La categoría ${nombreMayus} ya existe` });
    }

    const datosCategoria = {
      nombre: nombreMayus,
      usuario: req.user._id,
    };
    const categoria = new Categoria(datosCategoria);
    await categoria.save();
    res
      .status(201)
      .json({ ok: true, message: "Categoría guardada", categoria });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre)
      return res
        .status(400)
        .json({ ok: false, message: "El nombre es requerido" });

    const nombreMayus = req.body.nombre.toUpperCase();
    const nombreEnUso = await Categoria.findOne({
      nombre: nombreMayus,
      _id: { $ne: id },
    });
    if (nombreEnUso) {
      return res
        .status(400)
        .json({ ok: false, message: "Ese nombre ya está en uso" });
    }

    const categoria = await Categoria.findByIdAndUpdate(
      id,
      { nombre: nombreMayus, usuario: req.user._id },
      { new: true },
    );
    if (!categoria)
      return res
        .status(404)
        .json({ ok: false, message: "Categoria no encontrada" });

    res
      .status(200)
      .json({ ok: true, message: "Categoría actualizada", categoria });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al actualizar la categoria" });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaBorrada = await Categoria.findByIdAndUpdate(
      id,
      {
        estado: false,
      },
      { new: true },
    );
    if (!categoriaBorrada) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la categoría para eliminar",
      });
    }
    res.status(200).json({
      ok: true,
      message: "Categoria eliminada",
      categoriaBorrada,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al eliminar la categoría" });
  }
};

const traerCategorias = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const filtro = { estado: true };

    const [total, categorias] = await Promise.all([
      Categoria.countDocuments(filtro),
      Categoria.find(filtro)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate("usuario", "username"),
    ]);

    res.json({
      ok: true,
      message: "Obtenido categorías con éxito",
      total,
      categorias,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al traer las categorias" });
  }
};

export {
  traerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
