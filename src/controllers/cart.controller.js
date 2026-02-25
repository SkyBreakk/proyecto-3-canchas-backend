import Cart from "../models/Cart.js";
import Producto from "../models/Product.js";

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ usuario: req.user.id }).populate(
      "items.producto",
    );
    res.json(cart || { items: [], total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;
    const producto = await Producto.findById(productoId);

    let cart = await Cart.findOne({ usuario: req.user.id });
    if (!cart) {
      cart = new Cart({ usuario: req.user.id, items: [] });
    }

    const itemExistente = cart.items.find(
      (item) => item.producto.toString() === productoId,
    );

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      cart.items.push({
        producto: productoId,
        cantidad,
        precioUnitario: producto.precio,
      });
    }

    cart.calcularTotal();
    await cart.save();

    const cartPopulated = await cart.populate("items.producto");

    res.json(cartPopulated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar item del carrito----------------------------------------------------
export const removeFromCart = async (req, res) => {
  try {
    const { productoId } = req.params;

    const cart = await Cart.findOne({ usuario: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.items = cart.items.filter(
      (item) => item.producto.toString() !== productoId,
    );
    cart.calcularTotal();
    await cart.save();

    const cartPopulated = await cart.populate("items.producto");

    res.json(cartPopulated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar cantidad----------------------------------------------------------
export const updateCartItem = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    const cart = await Cart.findOne({ usuario: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const item = cart.items.find((i) => i.producto.toString() === productoId);

    if (!item) {
      return res.status(404).json({ error: "Item no encontrado en carrito" });
    }

    item.cantidad = cantidad;
    cart.calcularTotal();
    await cart.save();

    const cartPopulated = await cart.populate("items.producto");

    res.json(cartPopulated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vaciar carrito
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ usuario: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
