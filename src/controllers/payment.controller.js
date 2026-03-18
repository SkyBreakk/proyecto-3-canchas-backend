import { MercadoPagoConfig, Preference } from "mercadopago";

const createPayment = async (req, res) => {
  try {
    const { titulo, cantidad, precio, reservaId } = req.body;
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

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
          success: process.env.CORS_ORIGIN + "/success",
          failure: process.env.CORS_ORIGIN + "/failure",
          pending: process.env.CORS_ORIGIN + "/pending",
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
    console.log("ERROR DETALLADO MP:", error.response?.data || error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

export { createPayment };
