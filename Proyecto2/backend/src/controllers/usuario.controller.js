import Usuario from "../model/usuario.model.js";
import getCodigo from "../utils/idgener.js";
// ==================================== Crear ====================================
export const createUsuario = async (req, res) => {
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
};
// ==================================== Leer, Filtrar ====================================
export const getUsuarios = async (req, res) => {
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
};

// Numero total de usuarios registrados en la biblioteca GET http://localhost:5000/usuarios/total_registrados

export const getTotalUsuarios = async (req, res) => {
    try {
        const totalUsuarios = await Usuario.countDocuments();
        res.status(200).send({ total_usuarios: totalUsuarios });
    } catch (error) {
        res.status(500).send({ message: 'Error al buscar los usuarios.', error });
    }
};

// ====================================== Actualizar =====================================

export const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, req.body, { new: true });
    
    if (usuarioActualizado) {
        res.status(200).send({ message: 'Usuario actualizado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Usuario no encontrado.' });
    }
}

// ====================================== Eliminar =====================================
export const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);

    if (usuarioEliminado) {
        res.status(200).send({ message: 'Usuario eliminado exitosamente.' });
    } else {
        res.status(404).send({ message: 'Usuario no encontrado.' });
    }
}