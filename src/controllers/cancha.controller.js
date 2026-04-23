import Cancha from "../models/Cancha.js";

const registrarCancha = async (req, res) => {
  try {
    const { precio, descripcion, img } = req.body;
    const nombre = req.body.nombre.toUpperCase();

    const canchaExistente = await Cancha.findOne({ nombre });
    if (canchaExistente) {
      return res.status(400).json({
        message: `La cancha ${nombre} ya existe`,
      });
    }

    const datosCancha = {
      nombre,
      descripcion,
      precio,
      img,
      usuario: req.user._id,
    };
    const cancha = new Cancha(datosCancha);
    await cancha.save();

    res.status(201).json({
      ok: true,
      message: "Cancha registrada con exito",
      data: cancha,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const obtenerCanchasDisponibles = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const filtro = { estado: true };

    const [total, canchas] = await Promise.all([
      Cancha.countDocuments(filtro),
      Cancha.find(filtro)
        .skip(desde)
        .limit(limite)
        .populate("usuario", "username"),
    ]);

    return res.status(200).json({
      ok: true,
      message: "Canchas obtenidas correctamente",
      total,
      canchas,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener las canchas" });
  }
};

const actualizarCancha = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, precio, img, nombre } = req.body;
    if (nombre) {
      const nombreMayus = nombre.toUpperCase();
      const canchaDuplicada = await Cancha.findOne({
        nombre: nombreMayus,
        _id: { $ne: id },
      });
      if (canchaDuplicada) {
        return res.status(400).json({
          ok: false,
          message: "El nuevo nombre ya está siendo usado por otra cancha",
        });
      }
    }

    let datosActualizados = {
      nombre: nombre ? nombre.toUpperCase() : undefined,
      descripcion,
      precio,
      img,
      usuario: req.user._id,
    };
    const cancha = await Cancha.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    });
    if (!cancha) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la cancha en el servidor",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Cancha actualizada con exito",
      data: cancha,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

const removerCancha = async (req, res) => {
  try {
    const { id } = req.params;
    const cancha = await Cancha.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );
    if (!cancha) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la cancha",
      });
    }
    res.status(200).json({
      ok: true,
      message: "Cancha eliminada con exito",
      cancha,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al connectarse con el servidor",
    });
  }
};

export {
  registrarCancha,
  obtenerCanchasDisponibles,
  actualizarCancha,
  removerCancha,
};
