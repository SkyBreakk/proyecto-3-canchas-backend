import { Schema, model } from "mongoose";

const canchaSchemna = Schema({
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        default: 0
    },
    estado: {
        type: Boolean,
        default: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});

export default model("Cancha", canchaSchemna);
