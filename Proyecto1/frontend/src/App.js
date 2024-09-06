import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Inicio from './components/inicio';
import Clientes from './components/clientes';
import Bodegas from './components/bodegas';
import CuartosFrios from './components/cuartosfrios';
import Productos from './components/productos';
import PreciosHistorial from './components/precioshistorial';
import ProductosEnBodega from './components/productoenbodega';
import Pedidos from './components/pedidos';

function App() {
  return (
    <div className="App">
      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Ventas S.A.</Link>
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
                  <Link className="nav-link" to="/clientes">Clientes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/bodegas">Bodegas</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/productos">Productos</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pedidos">Pedidos</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <br />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/bodegas" element={<Bodegas />} />
          <Route path="/cuartosfrios/:codigo_bodega" element={<CuartosFrios />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:codigo_bodega" element={<ProductosEnBodega />} />
          <Route path="/precioshistorial/:codigo_producto" element={<PreciosHistorial />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;