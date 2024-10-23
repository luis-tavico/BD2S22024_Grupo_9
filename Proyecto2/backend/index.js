import express from 'express';
import cors from 'cors';
import DBConnect from './src/config/mongo.config.js';
import usuario from './src/route/usuario.router.js';
import libros from './src/route/libros.router.js';
import autor from './src/route/autor.router.js';
const app = express();
app.use(cors());
app.use(express.json());

// Database connection
DBConnect();

// Routes
app.use(usuario, libros,autor);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});