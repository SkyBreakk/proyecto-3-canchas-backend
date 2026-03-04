import { MercadoPagoConfig, Preference } from "mercadopago";

const createPayment = async (req, res) => {
  try {
    const { titulo, cantidad, precio } = req.body;
    const client = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN,});

    const preference = new Preference(client);

    const referenciaPago = await preference.create({
      body: {
        items: [
          {
            title: titulo,
            quantity: cantidad,
            unit_price: precio,
          },
        ],
        back_url: {
          success: "http://localhost:4500/success",
          failure: "http://localhost:4500/failure",
          pending: "http://localhost:4500/pending",
        },
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
