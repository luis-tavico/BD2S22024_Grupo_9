import mongoose from "mongoose";

const libroSchema = new mongoose.Schema(
    {
        codigo: { type: Number, unique: true },
        titulo: { type: String, required: true },
        anio_publicacion: { type: Number, required: true },
        genero: { type: String, required: true },
        disponibilidad: { type: Boolean, required: true },
        autor_id: { type: Number, required: true }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
        versionKey: false
    }
);


export default mongoose.model("Libro", libroSchema);