import express from 'express';
import {createLibro,getLibros,updateLibro,deleteLibro} from '../controllers/libros.controllers.js';
const router = express.Router();
router.post('/libros', createLibro);
router.get('/libros', getLibros);
router.put('/libros/:id', updateLibro);
router.delete('/libros/:id', deleteLibro);
export default router;