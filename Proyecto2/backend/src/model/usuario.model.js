import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
        codigo: { type: Number, unique: true },
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        email: { type: String, required: true },
        fecha_registro: { type: Date, required: true }
    },
    {
        timestamps: true,
        versionKey: false
    }   
);

export default mongoose.model("Usuario", usuarioSchema);