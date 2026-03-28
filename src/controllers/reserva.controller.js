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
        message: "Horario ocupado para la duración seleccionada",
      });
    }

    const data = {
      usuario: req.user._id,
      cancha,
      senia,
      fecha: fechaLocal.toISOString(),
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

const getReservasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.user._id;

    const reservas = await Reserva.find({
      usuario: usuarioId,
      estado: true,
    })
      .populate("cancha", "nombre img precio")
      .sort({ fecha: -1 });

    res.json({
      ok: true,
      reservas,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Error al obtener reservas" });
  }
};

const getHorariosPorFecha = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.body;

    if (!id || !fecha) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos necesarios (cancha o fecha)",
      });
    }

    const horariosBase = [];
    for (let hora = 13; hora <= 23; hora++) {
      horariosBase.push(`${hora.toString().padStart(2, "0")}:00`);
    }

    const reservasBD = await Reserva.find({ estado: true, cancha: id });
    const horariosDisponibles = [];

    const ahora = new Date();
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date().toISOString().split("T")[0];
    const esHoy = fecha === hoy;

    for (const horario of horariosBase) {
      const nuevoInicio = new Date(`${fecha}T${horario}:00`).getTime();
      const nuevoFin = nuevoInicio + 1 * 60 * 60 * 1000;

      if (esHoy && nuevoInicio < ahora.getTime()) {
        continue;
      }

      const ocupado = reservasBD.some((reservaBD) => {
        const existenteInicio = new Date(reservaBD.fecha).getTime();
        const existenteFin = existenteInicio + reservaBD.horas * 60 * 60 * 1000;

        return nuevoInicio < existenteFin && nuevoFin > existenteInicio;
      });

      if (!ocupado) {
        horariosDisponibles.push(horario);
      }
    }

    return res.status(200).json({
      ok: true,
      horarios: horariosDisponibles,
    });
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener horarios",
      error: error.message,
    });
  }
};

const updatePagoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoPago, metodoPago } = req.body;

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      { estadoPago, metodoPago },
      { new: true },
    )
      .populate("usuario", "username email")
      .populate("cancha", "nombre");

    if (!reservaActualizada) {
      return res.status(404).json({
        ok: false,
        message: "Reserva no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Estado de pago actualizado correctamente",
      reserva: reservaActualizada,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar el pago",
    });
  }
};
export {
  registerReserva,
  getReserva,
  deleteReserva,
  getReservasDisponibles,
  getHorariosPorFecha,
  getReservasPorUsuario,
  updatePagoReserva,
};
