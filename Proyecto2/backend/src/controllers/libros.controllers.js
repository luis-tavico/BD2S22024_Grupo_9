import getCodigo from "../utils/idgener.js";
import Libro from "../model/libro.model.js";

export const createLibro = async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            let codigo = await getCodigo(Libro);
            const libros = req.body.map(libro => {
                return { ...libro, codigo: codigo++ };
            });
            await Libro.insertMany(libros);
            res.status(201).send({ message: 'Libros creados exitosamente.' });
        } else {
            const codigo = await getCodigo(Libro);
            const libro = new Libro({ ...req.body, codigo: codigo });
            await libro.save();
            res.status(201).send({ message: 'Libro creado exitosamente.' });
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

// ==================================== Leer, Filtrar ====================================
export const getLibros = async (req, res) => {
    try {
        const { genero, desde, hasta, clave, disponible, recientes } = req.query;
        let libros;
        const query = {};
        // Por genero, Uso: GET http://localhost:5000/libros?genero=Thriller
        if (genero) {
            query.genero = { $regex: genero, $options: 'i' };
        }
        // Por rango de años, Uso: GET http://localhost:5000/libros?desde=1990&hasta=2005
        if (desde && hasta) {
            query.anio_publicacion = {
                $gte: parseInt(desde),
                $lte: parseInt(hasta)
            };
        }
        // Por titulo parcial, Uso: GET http://localhost:5000/libros?clave=array
        if (clave) {
            query.titulo = { $regex: clave, $options: 'i' };
        }
        // Por disponibilidad, Uso: GET http://localhost:5000/libros?disponible=true
        if (disponible) {
            query.disponibilidad = disponible === 'true';
        }
        // Por mas recientes, Uso: GET http://localhost:5000/libros?recientes=5
        if (recientes) {
            libros = await Libro.find(query).sort({ anio_publicacion: -1 }).limit(recientes);
        } else {
            libros = await Libro.find(query); // Si no hay consulta, muestra todos los libros
        }

        res.status(200).send(libros);

    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los libros.', error });
    }
}

// ==================================== Actualizar ====================================
export const updateLibro = async (req, res) => {
    const { id } = req.params;
    const libroActualizado = await Libro.findByIdAndUpdate(id, req.body, { new: true });
    
    if (libroActualizado) {
        res.status(200).send({ message: 'Libro actualizado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Libro no encontrado.' });
    }
};

// ==================================== Eliminar ====================================
export const deleteLibro = async (req, res) => {
    const { id } = req.params;
    const libroEliminado = await Libro.findByIdAndDelete(id);
    
    if (libroEliminado) {
        res.status(200).send({ message: 'Libro eliminado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Libro no encontrado.' });
    }
};