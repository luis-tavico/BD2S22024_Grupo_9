import express from 'express';
import {createAutor,getAutores,
    getLibrosEscritos,getAutoresLibrosEscritos,
    updateAutor,deleteAutor} from '../controllers/autor.controllers.js';

const router = express.Router();

router.post('/autores',createAutor);
router.get('/autores',getAutores);
router.get('/autores/:id/libros_escritos',getLibrosEscritos);
router.get('/autores/libros_escritos',getAutoresLibrosEscritos);
router.put('/autores/:id',updateAutor);
router.delete('/autores/:id',deleteAutor);

export default router;