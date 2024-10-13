import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function AutoresLibros() {
    const [autores, setAutores] = useState([]);
    const { id } = useParams(); 

    useEffect(() => {
        const fetchAutores = async () => {
            const url = id 
                ? `http://localhost:5000/autores/${id}/libros_escritos` 
                : 'http://localhost:5000/autores/libros_escritos';

            try {
                const response = await axios.get(url);
                setAutores(response.data);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchAutores();
    }, [id]);

    return (
        <div className="container-clients">
            <div className="row">
                <h1 className="text-center">Autores</h1>
                <div className="col-10 offset-1">
                    <table className="table table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                {['Codigo', 'ID', 'Nombre', 'Apellido', 'Nacionalidad', 'Libros escritos'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {autores.map((autor) => (
                                <tr key={autor._id}>
                                    <td>{autor.codigo}</td>
                                    <td>{autor._id}</td>
                                    <td>{autor.nombre}</td>
                                    <td>{autor.apellido}</td>
                                    <td>{autor.nacionalidad.join(', ')}</td>
                                    <td>{autor.cantidad_libros}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AutoresLibros;
