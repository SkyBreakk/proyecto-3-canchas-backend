import { model, Schema } from "mongoose";

const ReservaSchema = Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cancha: {
        type: Schema.Types.ObjectId,
        ref: "Cancha",
        required: true
    },
    senia: {
        type: Number,
        default: 0
    },
    fecha: {
        type: Date,
        default: new Date
    },
    horas: {
        type: Number,
        default: 2
    },
    estado: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

ReservaSchema.methods.confirmarReserva = function (auxFecha, auxHora) {
    if(auxFecha === this.fecha){
        return false
    }
    /*
    if (auxFecha.getFullYear() == this.fecha.getFullYear() &&
        auxFecha.getMonth() == this.fecha.getMonth() &&
        auxFecha.getDate() == this.fecha.getDate() &&
        this.fecha.getHours() == auxFecha.getHours() &&
        parseFloat(this.fecha.getHours()) + this.horas < auxFecha.getHours()) {
        return false
    }
    */
    return true
}

export default model("Reserva", ReservaSchema)