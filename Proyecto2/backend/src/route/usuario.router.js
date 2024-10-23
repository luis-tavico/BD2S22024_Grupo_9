import express from 'express';
import {createUsuario,getUsuarios,getTotalUsuarios,
    updateUsuario,deleteUsuario} from '../controllers/usuario.controller.js';
const router = express.Router();

router.post('/usuarios', createUsuario);
router.get('/usuarios', getUsuarios);
router.get('/usuarios/total_registrados', getTotalUsuarios);
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);

export default router;