import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Inicio() {
  const [idAutor, setIdAutor] = useState('');
  const navigate = useNavigate();

  const handleVerAutor = () => {
    if (idAutor) {
      navigate(`/autores/${idAutor}/libros_escritos`);
    } else {
      toast.info('Ingresa un ID de autor valido', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };

  return (
    <div className="Inicio">
      
      <div>
        <ToastContainer />
      </div>

      <header className="text-center my-5">
        <h1>Bienvenidos a la Biblioteca Virtual</h1>
        <p>Libros, autores, y usuarios.</p>
      </header>

      <div className="container">
        <div className="row">

          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Autores</h5>
                <p className="card-text">Ver la lista de todos los autores y la cantidad de libros escritos.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/autores/libros_escritos')}
                >
                  Ver Autores
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Autor</h5>
                <p className="card-text">Ver autor y la cantidad de libros escritos.</p>
                <input
                  type="text"
                  className="form-control"
                  id="idAutor"
                  placeholder="Ingresar ID del Autor"
                  value={idAutor}
                  onChange={(e) => setIdAutor(e.target.value)}
                />
                <button
                  className="btn btn-primary mt-3"
                  onClick={handleVerAutor}
                >
                  Ver Autor
                </button>
              </div>
            </div>
          </div>


          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Usuarios</h5>
                <p className="card-text">Ver la cantidad de usuarios registrados actualmente.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/total_registrados')}
                >
                  Ver Cantidad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center my-5">
        <p>&copy; 2024 Biblioteca Virtual. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Inicio;
