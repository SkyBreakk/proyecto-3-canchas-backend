import { enviarCorreoDeContacto } from "../config/nodemailer.js";
import Cancha from "../models/Cancha.js";
import Reserva from "../models/Reserva.js";

const registrarReserva = async (req, res) => {
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

    const canchaExistente = await Cancha.findById(cancha);
    if (!canchaExistente) {
      return res.status(404).json({
        ok: false,
        message: "la cancha no existe",
      });
    }

    const reservasActivas = await Reserva.find({ estado: true, cancha });
    const reservaSolapada = reservasActivas.some((reserva) => {
      return reserva.controlSolapamiento(fechaLocal, horas);
    });
    if (reservaSolapada) {
      return res.status(400).json({
        ok: false,
        message: "Horario ocupado para la duración seleccionada",
      });
    }

    const datosReserva = {
      usuario: req.user._id,
      cancha,
      senia,
      fecha: fechaLocal.toISOString(),
      horas,
    };
    const nuevaReserva = new Reserva(datosReserva);
    await nuevaReserva.save();

    return res.status(201).json({
      ok: true,
      message: "Reserva creada con exito",
      nuevaReserva,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const removerReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    if (!reserva) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la reserva para eliminar",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Reserva eliminada",
      reserva,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar la reserva",
      error: error.message,
    });
  }
};

const obtenerReservasActivas = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const filtro = { estado: true };

    const [total, reservas] = await Promise.all([
      Reserva.countDocuments(filtro),
      Reserva.find(filtro)
        .skip(desde)
        .limit(limite)
        .populate("usuario", "username")
        .populate("cancha", "nombre"),
    ]);

    res.status(200).json({
      ok: true,
      message: "Reservas obtenidas con éxito",
      total,
      reservas,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener las reservas",
      error: error.message,
    });
  }
};

export const contactoReserva = async (req, res) => {
  const { nombre, contacto, descripcion } = req.body;
  if (!nombre || !contacto) {
    return res.status(400).json({
      ok: "false",
      message: "Nombre y contacto son campos obligatorios",
    });
  }

  try {
    await enviarCorreoDeContacto(nombre, contacto, descripcion);
    return res.status(200).json({
      ok: true,
      message:
        "Tu consulta ha sido enviada con éxito. Nos contactaremos pronto",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message:
        "Hubo un problema al enviar el correo. Intenta de nuevo más tarde",
      error: error.message,
    });
  }
};

const obtenerReservasPorUsuario = async (req, res) => {
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
      message: "Reservas del usuario obtenidas",
      reservas,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener reservas",
      error: error.message,
    });
  }
};

const obtenerHorariosPorFecha = async (req, res) => {
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

    const reservasActivas = await Reserva.find({ estado: true, cancha: id });
    const horariosDisponibles = [];

    const ahora = new Date();
    const hoyISO = new Date().toISOString().split("T")[0];
    const esHoy = fecha === hoyISO;

    for (const horario of horariosBase) {
      const nuevoInicio = new Date(`${fecha}T${horario}:00`).getTime();
      const nuevoFin = nuevoInicio + 1 * 60 * 60 * 1000;

      if (esHoy) {
        continue;
      }

      const ocupado = reservasActivas.some((reservaBD) => {
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
      message: "Horarios disponibles obtenidos",
      horarios: horariosDisponibles,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al obtener horarios",
      error: error.message,
    });
  }
};

const actualizarPagoDeReserva = async (req, res) => {
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
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar el pago",
      error: error.message,
    });
  }
};
export {
  registrarReserva,
  removerReserva,
  obtenerReservasActivas,
  obtenerHorariosPorFecha,
  obtenerReservasPorUsuario,
  actualizarPagoDeReserva,
};
