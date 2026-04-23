import Cart from "../models/Cart.js";

export const obtenerCarrito = async (req, res) => {
  try {
    const carrito = await Cart.findOne({ usuario: req.user._id }).populate(
      "items.producto",
    );
    if (!carrito) return res.json({ items: [], total: 0 });

    carrito.items.forEach((item) => {
      if (item.producto) {
        item.precioUnitario = item.producto.precio;
      }
    });
    carrito.calcularTotal();
    await carrito.save();

    return res.status(200).json({
      ok: true,
      message: "Carrito obtenido con exito",
      cart: carrito,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const agregarAlCarrito = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;
    const producto = req.productoEncontrado;
    let carrito = await Cart.findOne({ usuario: req.user._id });
    if (!carrito) {
      carrito = new Cart({ usuario: req.user._id, items: [] });
    }

    const itemExistente = carrito.items.find(
      (item) => item.producto.toString() === productoId,
    );
    if (!itemExistente) {
      carrito.items.push({
        producto: productoId,
        cantidad,
        precioUnitario: producto.precio,
      });

      carrito.calcularTotal();
      await carrito.save();
    }

    const carritoActualizado = await carrito.populate("items.producto");
    res.json({
      ok: true,
      message: "Carrito actualizado con exito",
      cart: carritoActualizado,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const removerDelCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const carrito = await Cart.findOne({ usuario: req.user._id });
    if (!carrito) {
      return res
        .status(404)
        .json({ ok: false, message: "Carrito no encontrado" });
    }

    carrito.items = carrito.items.filter(
      (item) => item.producto.toString() !== productoId,
    );
    carrito.calcularTotal();
    await carrito.save();

    const carritoActualizado = await carrito.populate("items.producto");
    res.status(200).json({
      ok: true,
      message: "Producto removido con exito",
      cart: carritoActualizado,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const actualizarCantidadDeItem = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;
    const producto = req.productoEncontrado;
    const carrito = await Cart.findOne({ usuario: req.user._id });
    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    const item = carrito.items.find(
      (i) => i.producto.toString() === productoId,
    );
    if (!item) {
      return res
        .status(404)
        .json({ error: "El producto no está en el carrito" });
    }
    item.cantidad = cantidad;
    item.precioUnitario = producto.precio;
    carrito.calcularTotal();
    await carrito.save();

    const carritoActualizado = await carrito.populate("items.producto");
    res.status(200).json({
      ok: true,
      message: "Carrito actualizado con exito",
      cart: carritoActualizado,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const limpiarCarrito = async (req, res) => {
  try {
    const carrito = await Cart.findOne({ usuario: req.user.id });
    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    carrito.items = [];
    carrito.total = 0;
    await carrito.save();

    res.json({ ok: true, message: "Carrito limpiado con exito", carrito });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};
