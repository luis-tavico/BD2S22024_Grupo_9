import Autor from "../model/autor.model.js";
import Libro from "../model/libro.model.js";
import getCodigo from "../utils/idgener.js";
import mongoose from "mongoose";

export const createAutor = async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            let codigo = await getCodigo(Autor);
            const autores = req.body.map(autor => {
                return { ...autor, codigo: codigo++ };
            });
            await Autor.insertMany(autores);
            res.status(201).send({ message: 'Autores creados exitosamente.' });
        } else {
            const codigo = await getCodigo(Autor);
            const autor = new Autor({ ...req.body, codigo: codigo });
            await autor.save();
            res.status(201).send({ message: 'Autor creado exitosamente.' });
        }
    } catch (error) {
        res.status(400).send(error);
    }
};

// ==================================== Leer, Filtrar ====================================

export const getAutores = async (req, res) => {
    try {
        const { nacionalidades, nacionalidad, n } = req.query;
        let autores;
        // Por mas de una nacionalidad, Uso: GET http://localhost:5000/autores?nacionalidades=true
        if (nacionalidades == "true") {
            autores = await Autor.find({ $expr: { $gt: [{ $size: "$nacionalidad" }, 1] } });
        }
        // Por una nacionalidad especifica, Uso: GET http://localhost:5000/autores?nacionalidad=Mexican
        if (nacionalidad) {
            autores = await Autor.find({ nacionalidad: { $in: [nacionalidad] } });
        }
        // Por mas de una cantidad determinada de libros escritos, Uso: GET http://localhost:5000/autores?n=5
        if (n) {
            const nInt = parseInt(n);
            autores = await Autor.aggregate([
                {
                    $lookup: {
                        from: 'libros',
                        localField: 'codigo', 
                        foreignField: 'autor_id',
                        as: 'libros'
                    }
                },
                {
                    $match: {
                        $expr: {
                            $gte: [{ $size: "$libros" }, nInt]
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        codigo: 1,
                        nombre: 1,
                        apellido: 1,
                        nacionalidad: 1,
                        cantidad_libros: { $size: "$libros" }
                    }
                }
            ]);
        }       
        // Si no se especifica ningun filtro, muestra todos los autores
        if (!autores) {
            autores = await Autor.find();
        }
  
        res.status(200).send(autores);
    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los autores.', error });
    }
};

// Numero total de libros escritos por autor, Uso: GET http://localhost:5000/autores/:id/libros_escritos

export const getLibrosEscritos = async (req, res) => {
    try {
        const { id } = req.params;
        const autorConCantidad = await Autor.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'libros',
                    localField: 'codigo',
                    foreignField: 'autor_id',
                    as: 'libros'
                }
            },
            {
                $project: {
                    _id: 1,
                    codigo: 1,
                    nombre: 1,
                    apellido: 1,
                    nacionalidad: 1,
                    cantidad_libros: { $size: "$libros" }
                }
            }
        ]);
        
        res.status(200).send( autorConCantidad );
    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los autores.', error: error.message });
    }
};

// Lista de autores y el numero total de libros escritos por cada uno, Uso: GET http://localhost:5000/autores/libros_escritos

export const getAutoresLibrosEscritos = async (req, res) => {
    try {
        const autoresConCantidad = await Autor.aggregate([
            {
                $lookup: {
                    from: 'libros',
                    localField: 'codigo', 
                    foreignField: 'autor_id',
                    as: 'libros'
                }
            },
            {
                $project: {
                    _id: 1,
                    codigo: 1,
                    nombre: 1,
                    apellido: 1,
                    nacionalidad: 1,
                    cantidad_libros: { $size: "$libros" }
                }
            }
        ]);

        res.status(200).send(autoresConCantidad);

    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los autores.', error });
    }
};
// ==================================== Actualizar ====================================

export const updateAutor = async (req, res) => {
    const { id } = req.params;
    const autorActualizado = await Autor.findByIdAndUpdate(id, req.body, { new: true });
    
    if (autorActualizado) {
        res.status(200).send({ message: 'Autor actualizado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Autor no encontrado.' });
    }
};
// ==================================== Eliminar ====================================
export const deleteAutor = async (req, res) => {
    const { id } = req.params;
    const autor = await Autor.findById(id);
    
    if (autor) {
        const libros = await Libro.find({ autor_id: autor.codigo });
        if (libros.length > 0) {
            res.status(200).send({ status: 'ERR', message: 'No se pudo eliminar el autor. Existen libros asociados.' });
        } else {
            const autorEliminado = await Autor.findByIdAndDelete(id);
            res.status(200).send({ status: 'OK', message: 'Autor eliminado exitosamente.' });
        }
    } else {
        res.status(404).send({ message: 'Autor no encontrado.' });
    }
};

