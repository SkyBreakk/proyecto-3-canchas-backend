import { MercadoPagoConfig, Preference } from "mercadopago";
import Producto from "../models/Product.js";
import Cart from "../models/Cart.js";
import Reserva from "../models/Reserva.js";
import Cancha from "../models/Cancha.js";

const crearPago = async (req, res) => {
  try {
    const { tipo, cantidad, id } = req.body;
    let titulo,
      precioUnidad,
      cantidadElegida = 1;
    let external_reference = id;

    if (!tipo)
      return res
        .status(400)
        .json({ ok: false, message: "Tipo de pago requerido" });

    if (tipo === "directa") {
      const producto = await Producto.findById(id);
      if (!producto)
        return res
          .status(404)
          .json({ ok: false, message: "Producto no encontrado" });
      if (!producto.estado) {
        res.status(404).json({ ok: false, message: "Producto no disponible" });
      }
      if (producto.stock < cantidad) {
        res
          .status(400)
          .json({ ok: false, message: "Cantidad supera el stock disponible" });
      }

      titulo = producto.nombre || "Producto - Zona5";
      precioUnidad = Number(producto.precio);
      cantidadElegida = Number(cantidad) || 1;
    } else if (tipo === "carrito") {
      const carrito = await Cart.findOne({ usuario: req.user._id }).populate(
        "items.producto",
      );
      if (!carrito || carrito.items.length === 0) {
        return res
          .status(404)
          .json({ ok: false, message: "Carrito vacío o no encontrado" });
      }
      const costoEnvio = 20000;
      titulo = "Compra E-shop - Zona5";
      precioUnidad = Number(carrito.total) + costoEnvio;
    } else if (tipo === "reserva") {
      const reserva = await Reserva.findById(id).populate("cancha");
      if (!reserva)
        return res
          .status(404)
          .json({ ok: false, message: "Reserva no encontrada" });
      if (reserva.usuario.toString() !== req.user._id.toString()) {
        return res.status(403).json({ ok: false, message: "No autorizado" });
      }
      if (reserva.estadoPago === "Pagado") {
        return res
          .status(400)
          .json({ ok: false, message: "Esta reserva ya fue abonada" });
      }

      titulo = `Reserva: ${reserva.cancha.nombre}`;
      precioUnidad = Number(reserva.cancha.precio) * reserva.horas;
    }

    const cliente = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const preferencia = new Preference(cliente);
    const preferenceData = {
      body: {
        items: [
          {
            title: titulo,
            quantity: cantidadElegida,
            unit_price: precioUnidad,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.CORS_ORIGIN}/success`,
          failure: `${process.env.CORS_ORIGIN}/failure`,
          pending: `${process.env.CORS_ORIGIN}/pending`,
        },
        external_reference: external_reference,
      },
    };
    const response = await preferencia.create(preferenceData);
    res.status(200).json({
      ok: true,
      message: "Link de pago generada correctamente",
      id: response.id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error interno", error: error.message });
  }
};

export { crearPago };
