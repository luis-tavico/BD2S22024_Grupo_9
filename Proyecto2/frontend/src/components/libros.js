import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Papa from 'papaparse';

const FormFields = ({ formData, handleChange }) => (
    <>
        <div className="form-group">
            <label>Titulo</label>
            <input
                type="text"
                className="form-control"
                name="titulo"
                value={formData.titulo || ''}
                onChange={handleChange}
            />
        </div>
        <div className="form-group">
            <label>Genero</label>
            <input
                type="text"
                className="form-control"
                name="genero"
                value={formData.genero || ''}
                onChange={handleChange}
            />
        </div>
        <div className="form-group">
            <label>Año de publicacion</label>
            <input
                type="number"
                className="form-control"
                name="anio_publicacion"
                value={formData.anio_publicacion || ''}
                onChange={handleChange}
            />
        </div>
        <div className="form-group">
            <label>Disponible</label>
            <select
                className="form-control"
                name="disponibilidad"
                value={formData.disponibilidad || ''}
                onChange={handleChange}
            >
                <option value="">Seleccionar</option>
                <option value="true">Si</option>
                <option value="false">No</option>
            </select>
        </div>
        <div className="form-group">
            <label>Autor</label>
            <input
                type="number"
                className="form-control"
                name="autor_id"
                value={formData.autor_id || ''}
                onChange={handleChange}
            />
        </div>
    </>
);

const SearchFilters = ({ searchParams, handleSearchChange, handleSearch }) => (
    <div className="row mb-1">
        {/* Por genero */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Genero:</label>
            <input
                type="text"
                className="form-control"
                placeholder="Ingresar genero"
                name="genero"
                value={searchParams.genero || ''}
                onChange={handleSearchChange}
            />
        </div>
        {/* Por rango de años */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <div className="row">
                <label>Rango de años:</label>
                <div className="col">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="De"
                        name="desde"
                        value={searchParams.desde || ''}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="col">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="A"
                        name="hasta"
                        value={searchParams.hasta || ''}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
        </div>
        {/* Por titulo parcial */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Titulo parcial:</label>
            <input
                type="text"
                className="form-control"
                placeholder="Ingresar palabra"
                name="clave"
                value={searchParams.clave || ''}
                onChange={handleSearchChange}
            />
        </div>
        {/* Por disponibilidad */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Disponible:</label>
            <select
                className="form-control"
                name="disponible"
                value={searchParams.disponible || ''}
                onChange={handleSearchChange}
            >
                <option value="">Seleccionar</option>
                <option value="true">Si</option>
                <option value="false">No</option>
            </select>
        </div>
        {/* Por mas recientes */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Mas recientes:</label>
            <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                name="recientes"
                value={searchParams.recientes || ''}
                onChange={handleSearchChange}
            />
        </div>
        {/* Botón de búsqueda */}
        <div className="col d-flex align-items-center">
            <button className="btn btn-primary w-100" onClick={handleSearch}>
                Buscar
            </button>
        </div>
    </div>
);

const Modal = ({ id, title, children, onSave, onClose, saveLabel = "Guardar", closeLabel = "Cerrar", saveClass = "btn-primary" }) => (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{closeLabel}</button>
                    <button type="button" className={`btn ${saveClass}`} data-bs-dismiss="modal" onClick={onSave}>{saveLabel}</button>
                </div>
            </div>
        </div>
    </div>
);

function Libros() {
    const [libros, setLibros] = useState([]);
    const [selectedLibro, setSelectedLibro] = useState(null);
    const [formData, setFormData] = useState({});
    const [libroAEliminar, setLibroAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchParams, setSearchParams] = useState({
        genero: '',
        desde: '',
        hasta: '',
        clave: '',
        disponible: ''
    });

    useEffect(() => {
        fetchLibros();
    }, []);

    const fetchLibros = (query = '') => {
        axios.get(`http://localhost:5000/libros${query}`)
            .then(response => setLibros(response.data))
            .catch(error => console.error('Error:', error));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {
        const request = isEdit
            ? axios.put(`http://localhost:5000/libros/${selectedLibro._id}`, formData)
            : axios.post('http://localhost:5000/libros', formData);
        request.then((response) => {
            toast.success(response.data.message, {
                autoClose: 1500,
                hideProgressBar: true,
            });
            fetchLibros();
            resetForm();
        }).catch(error => console.error('Error:', error));
    };

    const handleEditClick = (libro) => {
        setSelectedLibro(libro);
        setFormData(libro);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedLibro(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/libros/${libroAEliminar._id}`)
            .then((response) => {
                toast.success(response.data.message, {
                    autoClose: 1500,
                    hideProgressBar: true,
                });
                fetchLibros();
                setLibroAEliminar(null);
            })
            .catch(error => console.error('Error:', error));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    Papa.parse(event.target.result, {
                        header: true,
                        complete: (result) => {
                            const jsonContent = result.data.map(libro => ({
                                titulo: libro.titulo,
                                genero: libro.genero,
                                disponibilidad: libro.disponibilidad.toLowerCase() === 'true',
                                anio_publicacion: parseInt(libro.anio_publicacion, 10),
                                autor_id: parseInt(libro.autor_id)
                            }));
                            axios.post('http://localhost:5000/libros', jsonContent)
                                .then(() => fetchLibros())
                                .catch(error => console.error('Error:', error));
                        },
                        error: (error) => {
                            console.error('Error:', error);
                        }
                    });
                } catch (error) {
                    console.error('Error:', error);
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const query = Object.entries(searchParams)
            .filter(([key, value]) => value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        fetchLibros(query ? `?${query}` : '');
    };

    return (
        <div className="container-clients">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="text-center">Libros</h1>

                <div className="col-10 offset-1 mb-3">
                    <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#createModal">Crear</button>
                    {' '}
                    <label className="btn btn-primary">
                        Cargar
                        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                </div>

                <div className="col-10 offset-1">
                    <SearchFilters
                        searchParams={searchParams}
                        handleSearchChange={handleSearchChange}
                        handleSearch={handleSearch}
                    />
                </div>

                <div className="col-10 offset-1">
                    <table className="table table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                {['Codigo', 'ID', 'Titulo', 'Genero', 'Año de publicacion', 'Disponible', 'Acciones'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {libros.map((libro) => (
                                <tr key={libro._id}>
                                    <td>{libro.codigo}</td>
                                    <td>{libro._id}</td>
                                    <td>{libro.titulo}</td>
                                    <td>{libro.genero}</td>
                                    <td>{libro.anio_publicacion}</td>
                                    <td>{libro.disponibilidad ? 'Si' : 'No'}</td>
                                    <td>
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(libro)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {' '}
                                        <button type="button" className="btns btnDelete" onClick={() => setLibroAEliminar(libro)} data-bs-toggle="modal" data-bs-target="#deleteModal">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Crear/Editar Modal */}
                <Modal
                    id="createModal"
                    title={isEdit ? "Editar Libro" : "Crear Libro"}
                    onSave={handleSave}
                >
                    <FormFields formData={formData} handleChange={handleFormChange} />
                </Modal>

                {/* Eliminar Modal */}
                <Modal
                    id="deleteModal"
                    title="Eliminar Libro"
                    onSave={handleDeleteConfirm}
                    saveLabel="Eliminar"
                    saveClass="btn-danger"
                >
                    <p>¿Está seguro que desea eliminar el libro?</p>
                </Modal>
            </div>
        </div>
    );
}

export default Libros;