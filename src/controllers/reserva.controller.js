import User from "../models/User.js";
import Cancha from "../models/Cancha.js";
import Reserva from "../models/Reserva.js";

const registerReserva = async (req, res) => {
    // "yyyy-mm-ddThh:mm:ss"
    const { senia, fecha, horas, cancha } = req.body;
    const canchaBD = await Cancha.findById(cancha);
    if (!canchaBD) {
        res.status(400).json({
            ok: false,
            message: "la cancha no existe"
        })
    }
    const bandera = true;
    const reservaBD = await Reserva.find({ cancha });
    reservaBD.forEach(function (auxReserva) {
        if (auxReserva.confirmarReserva(fecha, horas) == false) {
            bandera = false
        }
    });
    if (bandera == false) {
        res.status(400).json({
            ok: false,
            error: "La cancha no esta disponible en el horario requerido"
        })
    }
    const reserva = new Reserva({
        usuario: req.user._id,
        cancha,
        senia,
        fecha,
        //fecha: new Date(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate(), fecha.getHours(), 0, 0),
        horas
    });
    await reserva.save();
    res.status(201).json({
        ok: true,
        message: "Reserva creada con exito",
    })
};

const getReserva = async (req, res) => {
    const { id } = req.params;
    const reservaBD = await Reserva.findById(id);
    if (!reservaBD) {
        res.status(400).json({
            ok: false,
            message: "La reserva no existe"
        })
    }
    res.status(200).json({
        ok: true,
        reservaBD
    })
};

const deleteReserva = async (req, res) => {
    const { id } = req.params;
    const reservaBD = await Reserva.findByIdAndUpdate(id, { estado: false }, { news: true });
    res.status(200).json({
        ok: true,
        message: "Reserva eliminada",
        reservaBD
    })
};

export {
    registerReserva,
    getReserva,
    deleteReserva
}