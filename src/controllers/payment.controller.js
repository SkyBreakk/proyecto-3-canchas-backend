import { MercadoPagoConfig, Preference } from "mercadopago";

const createPayment = async (req, res) => {
  try {
    const { titulo, cantidad, precio,reservaId } = req.body;
    const client = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN,});

    const preference = new Preference(client);

    const referenciaPago = await preference.create({
      body: {
        items: [
          {
            title: titulo,
            quantity: cantidad,
            unit_price: Number(precio),
          },
        ],
        back_urls: {
          success: "http://localhost:9500/success",
          failure: "http://localhost:9500/failure",
          pending: "http://localhost:9500/pending",
        },
        // auto_return: "approved",
        external_reference: reservaId,
      },
    });

    res.status(200).json({
      ok: true,
      id: referenciaPago.id,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export { createPayment };
