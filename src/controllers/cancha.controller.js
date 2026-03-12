import Cancha from "../models/Cancha.js";

const registerCancha = async (req, res) => {
  try {
    const { precio, descripcion, img } = req.body;
    const nombre = req.body.nombre.toUpperCase();
    const canchaBD = await Cancha.findOne({ nombre });

    if (canchaBD) {
      return res.status(400).json({
        message: `La cancha ${nombre} ya existe`,
      });
    }

    const data = {
      nombre,
      descripcion,
      precio,
      img,
      usuario: req.user._id,
    };

    const cancha = new Cancha(data);
    await cancha.save();

    res.status(201).json(cancha);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const obtenerCancha = async (req, res) => {
  try {
    const { id } = req.params;
    const canchaBD = await Cancha.findById(id);

    res.status(200).json({
      ok: true,
      canchaBD,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: "La cancha no existe",
    });
  }
};

const obtenerCanchasDisponibles = async (req, res) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, canchas] = await Promise.all([
    Cancha.countDocuments(query),
    Cancha.find(query)
      .skip(desde)
      .limit(limite)
      .populate("usuario", "username"),
  ]);

  return res.status(200).json({
    total,
    canchas,
  });
};

const updateCancha = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, precio, img, nombre } = req.body;
    const user = req.user;

    const nombreBD = await Cancha.findOne({ nombre: nombre.toUpperCase(), estado: true, _id: { $ne: id } });

    if (nombreBD) {
      return res.status(400).json({
        ok: false,
        message: "El nombre coincide con otra cancha"
      })
    };

    let data = {
      nombre: nombre ? nombre.toUpperCase() : undefined,
      descripcion,
      precio,
      img,
      usuario: user._id
    };

    const cancha = await Cancha.findByIdAndUpdate(id, data, { new: true });

    if (!cancha) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la cancha en el servidor",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Cancha actualizada con exito",
      cancha
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};

const deleteCancha = async (req, res) => {
  try {
    const { id } = req.params;
    const canchaBD = await Cancha.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );
    if (!canchaBD) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la cancha",
      });
    }
    res.status(200).json({
      ok: true,
      message: "Cancha eliminada con exito",
      canchaBD,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};

export {
  registerCancha,
  obtenerCancha,
  obtenerCanchasDisponibles,
  updateCancha,
  deleteCancha,
};
