import express from 'express';
import {createLibro,getLibros,updateLibro} from '../controllers/libros.controllers.js';
const router = express.Router();
router.post('/libros', createLibro);
router.get('/libros', getLibros);
router.put('/libros/:id', updateLibro);
export default router;