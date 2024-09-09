import React from 'react';
import { useNavigate } from 'react-router-dom';

function Inicio() {
    const navigate = useNavigate();

    return (
        <div className="container mt-5">
            <div className="text-center">
                <h1 className="display-4">¡Bienvenido a Ventas S.A.!</h1>
            </div>
            <div className="text-center mt-4">
                <button 
                    type="button" 
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate(`/compras`)}
                    aria-label="Ir a la sección de compras"
                >
                    Comprar
                </button>
            </div>
        </div>
    );
}

export default Inicio;