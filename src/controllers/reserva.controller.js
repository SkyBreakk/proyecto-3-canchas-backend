import { sendContactEmail } from "../config/nodemailer.js";
import Cancha from "../models/Cancha.js";
import Reserva from "../models/Reserva.js";

const registerReserva = async (req, res) => {
  try {
    const { senia, horas, cancha, fecha } = req.body;

    let fechaLimpia = new Date(fecha.replace("Z", ""));
    const fechaLocal = new Date(
      fechaLimpia.getFullYear(),
      fechaLimpia.getMonth(),
      fechaLimpia.getDate(),
      fechaLimpia.getHours(),
      fechaLimpia.getMinutes(),
    );

    const canchaBD = await Cancha.findById(cancha);
    if (!canchaBD) {
      return res.status(404).json({
        ok: false,
        message: "la cancha no existe",
      });
    }
    const reservasBD = await Reserva.find({ estado: true, cancha });
    const reservaSolapada = reservasBD.some((reservaBD) => {
      return reservaBD.controlSolapamiento(fechaLocal, horas);
    });
    if (reservaSolapada) {
      return res.status(400).json({
        ok: false,
        message: "Horario ocupado",
      });
    }

    const data = {
      usuario: req.user._id,
      cancha,
      senia,
      fecha: fechaLocal.toString(),
      horas,
    };

    const reserva = new Reserva(data);
    await reserva.save();
    return res.status(201).json({
      ok: true,
      message: "Reserva creada con exito",
      data,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const checkDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, horas } = req.body;

    if (!id || !fecha || !horas) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos necesarios (cancha, fecha o horas)",
      });
    }

    let fechaLimpia = new Date(fecha.replace("Z", ""));
    const fechaConsulta = new Date(
      fechaLimpia.getFullYear(),
      fechaLimpia.getMonth(),
      fechaLimpia.getDate(),
      fechaLimpia.getHours(),
      fechaLimpia.getMinutes(),
    );

    const reservasBD = await Reserva.find({ estado: true, cancha: id });

    const reservaTemporal = new Reserva();

    const ocupado = reservasBD.some((reservaBD) => {
      return reservaBD.controlSolapamiento(fechaConsulta, horas);
    });

    if (ocupado) {
      return res.status(200).json({
        ok: false,
        disponible: false,
        message: "El horario seleccionado ya está ocupado",
      });
    }

    return res.status(200).json({
      ok: true,
      disponible: true,
      message: "El horario está disponible",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al verificar disponibilidad",
      error: error.message,
    });
  }
};

const getReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reservaBD = await Reserva.findById(id)
      .populate("usuario", "username")
      .populate("cancha", "nombre");
    if (!reservaBD) {
      return res.status(404).json({
        ok: false,
        message: "La reserva no existe",
      });
    }
    return res.status(200).json({
      ok: true,
      reservaBD,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al buscar la reserva",
    });
  }
};

const deleteReserva = async (req, res) => {
  const { id } = req.params;
  const reservaBD = await Reserva.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true },
  );
  res.status(200).json({
    ok: true,
    message: "Reserva eliminada",
    reservaBD,
  });
};

const getReservasDisponibles = async (req, res) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, reservas] = await Promise.all([
    Reserva.countDocuments(query),
    Reserva.find(query)
      .skip(desde)
      .limit(limite)
      .populate("usuario", "username")
      .populate("cancha", "nombre"),
  ]);

  res.status(200).json({
    total,
    reservas,
  });
};

export const contactoReserva = async (req, res) => {
  const { nombre, contacto, descripcion } = req.body;

  if (!nombre || !contacto) {
    return res.status(400).json({
      status: "error",
      message: "Nombre y contacto son campos obligatorios.",
    });
  }

  try {
    await sendContactEmail(nombre, contacto, descripcion);
    return res.status(200).json({
      ok: true,
      message:
        "Tu consulta ha sido enviada con éxito. Nos contactaremos pronto.",
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return res.status(500).json({
      ok: false,
      message:
        "Hubo un problema al enviar el correo. Intenta de nuevo más tarde.",
    });
  }
};

export {
  registerReserva,
  checkDisponibilidad,
  getReserva,
  deleteReserva,
  getReservasDisponibles,
};
