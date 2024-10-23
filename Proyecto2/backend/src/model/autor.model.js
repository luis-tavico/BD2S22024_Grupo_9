import mongoose from "mongoose";

const autorSchema = new mongoose.Schema( 
    {
        codigo: { type: Number, unique: true },
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        nacionalidad: { type: [String], required: true }
    },
    {
        timestamps: true,
        versionKey: false
    }   
);

export default mongoose.model("Autor", autorSchema);