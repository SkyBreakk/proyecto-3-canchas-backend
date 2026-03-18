import Producto from "../models/Product.js";
import Categoria from "../models/Category.js";

const obtenerProductos = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, productos] = await Promise.all([
    Producto.countDocuments(query),
    Producto.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("categoria", "nombre")
      .populate("usuario", "username"),
  ]);

  res.json({
    total,
    productos,
  });
};

const obtenerProducto = async (req = request, res = response) => {
  const { id } = req.params;
  const producto = await Producto.findById(id)
    .populate("categoria", "nombre")
    .populate("usuario", "username");

  res.json({
    producto,
  });
};

const crearProducto = async (req, res = response) => {
  try {
    const { precio, categoria, descripcion, stock, img, nombre } = req.body;
    const nombreUpper = nombre.toUpperCase();

    const productoDB = await Producto.findOne({ nombre: nombreUpper });
    if (productoDB) {
      return res
        .status(400)
        .json({ msg: `El producto ${productoDB.nombre} ya existe` });
    }

    const data = {
      nombre: nombreUpper,
      categoria,
      precio: Number(precio),
      descripcion,
      stock: Number(stock),
      img,
      usuario: req.user._id,
    };

    const producto = new Producto(data);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { precio, categoria, descripcion, stock, img, nombre } = req.body;

  const categoriaBD = await Categoria.findById(categoria);
  if (!categoriaBD) {
    return res
      .status(404)
      .json({ msg: `La categoria con ID ${categoria} no existe` });
  }

  let data = {
    precio: Number(precio),
    descripcion,
    categoria: categoriaBD._id,
    stock: Number(stock),
    img,
    usuario: req.user._id,
  };

  if (nombre) data.nombre = nombre.toUpperCase();

  try {
    const producto = await Producto.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar" });
  }
};

const borrarProducto = async (req, res) => {
  const { id } = req.params;

  const productoBorrado = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true },
  );

  res.json({
    productoBorrado,
  });
};

export {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  borrarProducto,
};
