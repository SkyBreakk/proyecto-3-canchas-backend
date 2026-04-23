import Producto from "../models/Product.js";
import Categoria from "../models/Category.js";

const obtenerProductos = async (req = request, res = response) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const filtro = { estado: true };

    const [total, productos] = await Promise.all([
      Producto.countDocuments(filtro),
      Producto.find(filtro)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate("categoria", "nombre")
        .populate("usuario", "username"),
    ]);

    res.status(200).json({
      ok: true,
      message: "Productos obtenidos con éxito",
      total,
      productos,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener los productos" });
  }
};

const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findById(id)
      .populate("categoria", "nombre")
      .populate("usuario", "username");

    if (!producto || !producto.estado) {
      return res.status(404).json({
        ok: false,
        mensaje: "El producto no existe o está inactivo",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Producto obtenido con éxito",
      producto,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: "ID de producto no válido" });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { precio, categoria, descripcion, stock, img, nombre } = req.body;
    const nombreMayus = nombre.toUpperCase();

    const productoExistente = await Producto.findOne({ nombre: nombreMayus });
    if (productoExistente) {
      return res.status(400).json({
        ok: false,
        message: `El producto ${productoExistente.nombre} ya existe`,
      });
    }

    const datosProducto = {
      nombre: nombreMayus,
      categoria,
      precio: Number(precio),
      descripcion,
      stock: Number(stock),
      img,
      usuario: req.user._id,
    };

    const producto = new Producto(datosProducto);
    await producto.save();

    res
      .status(201)
      .json({ ok: true, message: "Producto creado con éxito", producto });
  } catch (error) {
    res.status(500).json({ ok: true, message: "Error interno del servidor" });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { precio, categoria, descripcion, stock, img, nombre } = req.body;
    if (categoria) {
      const categoriaExistente = await Categoria.findById(categoria);
      if (!categoriaExistente) {
        return res.status(404).json({
          ok: false,
          message: "La categoría proporcionada no existe",
        });
      }
    }

    let datosActualizados = {
      precio: Number(precio),
      descripcion,
      categoria: categoria,
      stock: Number(stock),
      img,
      usuario: req.user._id,
    };
    if (nombre) datosActualizados.nombre = nombre.toUpperCase();

    const producto = await Producto.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    });
    if (!producto) {
      return res
        .status(404)
        .json({ ok: false, message: "Producto no encontrado" });
    }

    res
      .status(200)
      .json({ ok: true, message: "Producto actualizado con éxito", producto });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const removerProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const productoBorrado = await Producto.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );
    if (!productoBorrado) {
      return res
        .status(404)
        .json({ ok: false, message: "No se encontró el producot a eliminar" });
    }

    res.status(200).json({
      ok: true,
      message: "Producto eliminado con éxito",
      productoBorrado,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al eliminar el producto" });
  }
};

export {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  removerProducto,
};
