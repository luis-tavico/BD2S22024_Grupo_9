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
            <label>Nombre</label>
            <input
                type="text"
                className="form-control"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
            />
        </div>
        <div className="form-group">
            <label>Apellido</label>
            <input
                type="text"
                className="form-control"
                name="apellido"
                value={formData.apellido || ''}
                onChange={handleChange}
            />
        </div>
        <div className="form-group">
            <label>Nacionalidad</label>
            <input
                type="text"
                className="form-control"
                name="nacionalidad"
                value={formData.nacionalidad || ''}
                onChange={handleChange}
            />
        </div>
    </>
);

const SearchFilters = ({ searchParams, handleSearchChange, handleSearch }) => (
    <div className="row mb-1">
        {/* Por mas de una nacionalidad */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Mas de una nacionalidad:</label>
            <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="variasNacionalidades"
                    name="nacionalidades"
                    checked={searchParams.nacionalidades || false}
                    onChange={() => handleSearchChange({
                        target: {
                            name: 'nacionalidades',
                            value: !searchParams.nacionalidades
                        }
                    })}
                />
            </div>
        </div>
        {/* Por nacionalidad */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Nacionalidad:</label>
            <input
                type="text"
                className="form-control"
                placeholder="Ingresar nacionalidad"
                name="nacionalidad"
                value={searchParams.nacionalidad || ''}
                onChange={handleSearchChange}
            />
        </div>
        {/* Por libros escrito */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
            <label>Libros escritos:</label>
            <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                name="n"
                value={searchParams.n || ''}
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

function Autores() {
    const [autores, setAutores] = useState([]);
    const [selectedAutor, setSelectedAutor] = useState(null);
    const [formData, setFormData] = useState({});
    const [autorAEliminar, setAutorAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchParams, setSearchParams] = useState({
        genero: '',
        desde: '',
        hasta: '',
        clave: '',
        disponible: ''
    });

    useEffect(() => {
        fetchAutores();
    }, []);

    const fetchAutores = (query = '') => {
        axios.get(`http://localhost:5000/autores${query}`)
            .then(response => setAutores(response.data))
            .catch(error => console.error('Error:', error));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'nacionalidad') {
            setFormData(prevData => ({ 
                ...prevData, 
                [name]: value.split(',').map(n => n.trim())
            }));
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    const handleSave = () => {
        const request = isEdit
            ? axios.put(`http://localhost:5000/autores/${selectedAutor._id}`, formData)
            : axios.post('http://localhost:5000/autores', formData);
        request.then((response) => {
            toast.success(response.data.message, {
                autoClose: 1500,
                hideProgressBar: true,
            });
            fetchAutores();
            resetForm();
        }).catch(error => console.error('Error:', error));
    };

    const handleEditClick = (autor) => {
        setSelectedAutor(autor);
        setFormData(autor);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedAutor(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/autores/${autorAEliminar._id}`)
            .then((response) => {
                if (response.data.status === 'OK') {
                    toast.success(response.data.message, {
                        autoClose: 1500,
                        hideProgressBar: true,
                    });
                } else {
                    toast.error(response.data.message, {
                        autoClose: 1500,
                        hideProgressBar: true,
                    });
                }
                fetchAutores();
                setAutorAEliminar(null);
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
                            const jsonContent = result.data.map(autor => ({
                                nombre: autor.nombre,
                                apellido: autor.apellido,
                                nacionalidad: autor.nacionalidad,
                            }));
                            axios.post('http://localhost:5000/autores', jsonContent)
                                .then(() => fetchAutores())
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
        fetchAutores(query ? `?${query}` : '');
    };

    return (
        <div className="container-clients">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="text-center">Autores</h1>

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
                                {['Codigo', 'ID', 'Nombre', 'Apellido', 'Nacionalidad', 'Acciones'].map((header) => (
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
                                    <td>
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(autor)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {' '}
                                        <button type="button" className="btns btnDelete" onClick={() => setAutorAEliminar(autor)} data-bs-toggle="modal" data-bs-target="#deleteModal">
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
                    title={isEdit ? "Editar Autor" : "Crear Autor"}
                    onSave={handleSave}
                >
                    <FormFields formData={formData} handleChange={handleFormChange} />
                </Modal>

                {/* Eliminar Modal */}
                <Modal
                    id="deleteModal"
                    title="Eliminar Autor"
                    onSave={handleDeleteConfirm}
                    saveLabel="Eliminar"
                    saveClass="btn-danger"
                >
                    <p>¿Está seguro que desea eliminar el autor?</p>
                </Modal>
            </div>
        </div>
    );
}

export default Autores;