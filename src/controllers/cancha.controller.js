import Cancha from "../models/Cancha.js"

const registerCancha = async (req, res) => {
    try {
        const descripcion = req.body.descripcion.toUpperCase();
        const { precio } = req.body;
        const descripcionBD = await Cancha.findOne({ descripcion });
        if (descripcionBD) {
            return res.status(400).json({
                message: `La cancha ${descripcionBD.descripcion} ya existe`
            })
        };
        const cancha = new Cancha({
            descripcion,
            precio,
            usuario: req.user._id
        });
        await cancha.save();
        res.status(200).json({
            ok: true,
            message: `La cancha ${descripcion} ha sido registrada con exito`,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtenerCancha = async (req, res) => {
    try {
        const { id } = req.params;
        const canchaBD = await Cancha.findById(id);
        res.status(200).json({
            ok: true,
            canchaBD
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: "La cancha no existe"
        })
    }
};

const obtenerCanchasDisponibles = async (req, res) => {
    const canchasDisponibles = await Cancha.find({ estado: true });

    return res.status(200).json({
        ok: true,
        canchasDisponibles
    })
}

const updateCancha = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, precio } = req.body;
        const canchaBD = await Cancha.findByIdAndUpdate(id, { descripcion, precio }, { news: true });
        res.status(200).json({
            ok: true,
            message: "Modificación de cancha exitosa",
            canchaBD
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: "La cancha no existe"
        })
    }
};

const deleteCancha = async (req, res) => {
    try {
        const { id } = req.params;
        const canchaBD = await Cancha.findByIdAndUpdate(id, { estado: false }, { news: true });
        res.status(200).json({
            ok: true,
            message: "Cancha eliminada con exito",
            canchaBD
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: "La cancha no existe"
        })
    }
};

export {
    registerCancha,
    obtenerCancha,
    obtenerCanchasDisponibles,
    updateCancha,
    deleteCancha
}