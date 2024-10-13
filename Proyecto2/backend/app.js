const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ================================= CONEXION A MONGODB ==================================
mongoose.connect('mongodb://localhost:27017/biblioteca');

// ======================================= MONGODB =======================================
const AutorSchema = new mongoose.Schema({
    codigo: { type: Number, unique: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    nacionalidad: { type: [String], required: true }
});

const LibroSchema = new mongoose.Schema({
    codigo: { type: Number, unique: true },
    titulo: { type: String, required: true },
    anio_publicacion: { type: Number, required: true },
    genero: { type: String, required: true },
    disponibilidad: { type: Boolean, required: true },
    autor_id: { type: Number, required: true }
});

const UsuarioSchema = new mongoose.Schema({
    codigo: { type: Number, unique: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
    fecha_registro: { type: Date, required: true }
});

const Autor = mongoose.model('Autor', AutorSchema);
const Libro = mongoose.model('Libro', LibroSchema);
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// ====================================== FUNCIONES ======================================
// Generar id autoincrementable
async function getCodigo(model) {
    const ultimoCodigo = await model.findOne().sort({ codigo: -1 });
    return ultimoCodigo ? ultimoCodigo.codigo + 1 : 1;
}

// ======================================== AUTOR ========================================
// ======================================== Crear ========================================
app.post('/autores', async (req, res) => {
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
});

// ==================================== Leer, Filtrar ====================================
app.get('/autores', async (req, res) => {
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
});

// Numero total de libros escritos por autor, Uso: GET http://localhost:5000/autores/:id/libros_escritos
app.get('/autores/:id/libros_escritos', async (req, res) => {
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
});

// Lista de autores y el numero total de libros escritos por cada uno, Uso: GET http://localhost:5000/autores/libros_escritos
app.get('/autores/libros_escritos', async (req, res) => {
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
});

// ====================================== Actualizar =====================================
app.put('/autores/:id', async (req, res) => {
    const { id } = req.params;
    const autorActualizado = await Autor.findByIdAndUpdate(id, req.body, { new: true });
    
    if (autorActualizado) {
        res.status(200).send({ message: 'Autor actualizado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Autor no encontrado.' });
    }
});

// ======================================= Eliminar ======================================
app.delete('/autores/:id', async (req, res) => {
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

});

// ======================================= LIBROS ========================================
// ======================================== Crear ========================================
app.post('/libros', async (req, res) => {
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
});

// ==================================== Leer, Filtrar ====================================
app.get('/libros', async (req, res) => {
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
});

// ====================================== Actualizar =====================================
app.put('/libros/:id', async (req, res) => {
    const { id } = req.params;
    const libroActualizado = await Libro.findByIdAndUpdate(id, req.body, { new: true });
    
    if (libroActualizado) {
        res.status(200).send({ message: 'Libro actualizado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Libro no encontrado.' });
    }
});

// ======================================= Eliminar ======================================
app.delete('/libros/:id', async (req, res) => {
    const { id } = req.params;
    const libroEliminado = await Libro.findByIdAndDelete(id);
    
    if (libroEliminado) {
        res.status(200).send({ message: 'Libro eliminado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Libro no encontrado.' });
    }
});

// ====================================== USUARIOS =======================================
// ======================================== Crear ========================================
app.post('/usuarios', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            let codigo = await getCodigo(Usuario);
            const usuarios = req.body.map(usuario => {
                return { ...usuario, codigo: codigo++ };
            });
            await Usuario.insertMany(usuarios);
            res.status(201).send({ message: 'Usuarios creados exitosamente.' });
        } else {
            const codigo = await getCodigo(Usuario);
            const usuario = new Usuario({ ...req.body, codigo: codigo });
            await usuario.save();
            res.status(201).send({ message: 'Usuario creado exitosamente.' });
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

// ==================================== Leer, Filtrar ====================================
app.get('/usuarios', async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        let usuarios;
        const query = {};
        // Por registro en un rango de fechas, Uso: GET http://localhost:5000/usuarios?desde=2023&hasta=2024
        if (desde && hasta) {
            query.fecha_registro = {
                $gte: new Date(desde),
                $lte: new Date(hasta)
            };
        }
        usuarios = await Usuario.find(query); // Si no hay consulta, muestra todos los usuarios
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los usuarios.', error });
    }
});

// Numero total de usuarios registrados en la biblioteca GET http://localhost:5000/usuarios/total_registrados
app.get('/usuarios/total_registrados', async (req, res) => {
    try {
        const totalUsuarios = await Usuario.countDocuments();
        res.status(200).send({ total_usuarios: totalUsuarios });
    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los usuarios.', error });
    }
});

// ====================================== Actualizar =====================================
app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, req.body, { new: true });
    
    if (usuarioActualizado) {
        res.status(200).send({ message: 'Usuario actualizado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Usuario no encontrado.' });
    }
});

// ======================================= Eliminar ======================================
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    
    if (usuarioEliminado) {
        res.status(200).send({ message: 'Usuario eliminado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Usuario no encontrado.' });
    }
});

// =================================== Iniciar Servidor ==================================
app.listen(5000, () => {
    console.log('Servidor escuchando en puerto http://localhost:5000/');
});