import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TotalUsuarios() {
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTotalUsuarios();
    }, []);

    const fetchTotalUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/usuarios/total_registrados');
            setTotalUsuarios(response.data.total_usuarios);
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setError('Hubo un error al obtener el numero de usuarios.');
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 text-center">
                    {isLoading ? (
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <div className="card shadow-sm p-4">
                            <h3 className="card-title">Usuarios Registrados Actualmente</h3>
                            <p className="display-4">{totalUsuarios}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TotalUsuarios;