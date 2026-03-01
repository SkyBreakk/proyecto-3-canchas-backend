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
            fechaLimpia.getMinutes()
        );
        
        const canchaBD = await Cancha.findById(cancha);
        if (!canchaBD) {
            return res.status(404).json({
                ok: false,
                message: "la cancha no existe"
            })
        }
        const reservasBD = await Reserva.find({ estado: true, cancha });
        const reservaSolapada = reservasBD.some((reservaBD) => {
            return reservaBD.controlSolapamiento(fechaLocal, horas);
        });
        if (reservaSolapada) {
            return res.status(400).json({
                ok: false,
                message: "Horario ocupado"
            })
        }
        const reserva = new Reserva({
            usuario: req.user._id,
            cancha,
            senia,
            fecha: fechaLocal.toString(),
            horas
        });
        await reserva.save();
        return res.status(201).json({
            ok: true,
            message: "Reserva creada con exito",
        })
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
};

const getReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaBD = await Reserva.findOne({ _id: id, estado: true });
        if (!reservaBD) {
            return res.status(404).json({
                ok: false,
                message: "La reserva no existe"
            })
        }
        return res.status(200).json({
            ok: true,
            reservaBD
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al buscar la reserva"
        });
    }
};

const deleteReserva = async (req, res) => {
    const { id } = req.params;
    const reservaBD = await Reserva.findByIdAndUpdate(id, { estado: false }, { new: true });
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