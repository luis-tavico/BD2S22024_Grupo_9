import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Inicio from './components/inicio';
import Autores from './components/autores';
import AutoresLibros from './components/autores_libros';
import Libros from './components/libros';
import Usuarios from './components/usuarios';
import TotalUsuarios from './components/total_usuarios';

function App() {
  return (
    <div className="App">
      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Inicio</Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/autores">Autores</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/libros">Libros</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/usuarios">Usuarios</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/autores" element={<Autores />} />
          <Route path="/autores/libros_escritos" element={<AutoresLibros />} />
          <Route path="/autores/:id/libros_escritos" element={<AutoresLibros />} />
          <Route path="/libros" element={<Libros />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/total_registrados" element={<TotalUsuarios />} />
        </Routes>
      </Router>
    </div>
  );
}
export default App;