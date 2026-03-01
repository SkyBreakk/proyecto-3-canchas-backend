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
        type: String,
        required: true
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

ReservaSchema.methods.controlSolapamiento = function (nuevaFecha, nuevaHora) {
    const inicioNuevo = new Date(nuevaFecha).getTime();
    const finNuevo = inicioNuevo + (Number(nuevaHora) * 60 * 60 * 1000);
    const inicioExistente = new Date(this.fecha).getTime();
    const finExistente = inicioExistente + (this.horas * 60 * 60 * 1000);

    return inicioNuevo < finExistente && finNuevo > inicioExistente;
}


export default model("Reserva", ReservaSchema)