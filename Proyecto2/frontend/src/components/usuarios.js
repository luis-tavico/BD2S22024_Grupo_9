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
            <label>Email</label>
            <input
                type="text"
                className="form-control"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
            />
        </div>
        <div className="form-group">
            <label>Fecha de registro</label>
            <input
                type="text"
                className="form-control"
                name="fecha_registro"
                value={formData.fecha_registro || ''}
                onChange={handleChange}
            />
        </div>
    </>
);

const SearchFilters = ({ searchParams, handleSearchChange, handleSearch }) => (
    <div className="row mb-1">
        {/*  */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
        </div>
        {/* */}
        <div className="col border p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px', marginRight: '15px' }}>
        </div>
        {/* Filtro de rango de años */}
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

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [formData, setFormData] = useState({});
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchParams, setSearchParams] = useState({
        genero: '',
        desde: '',
        hasta: '',
        clave: '',
        disponible: ''
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = (query = '') => {
        axios.get(`http://localhost:5000/usuarios${query}`)
            .then(response => setUsuarios(response.data))
            .catch(error => console.error('Error:', error));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {
        const request = isEdit
            ? axios.put(`http://localhost:5000/usuarios/${selectedUsuario._id}`, formData)
            : axios.post('http://localhost:5000/usuarios', formData);
        request.then((response) => {
            toast.success(response.data.message, {
                autoClose: 1500,
                hideProgressBar: true,
            });
            fetchUsuarios();
            resetForm();
        }).catch(error => console.error('Error:', error));
    };

    const handleEditClick = (usuario) => {
        setSelectedUsuario(usuario);
        setFormData(usuario);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedUsuario(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/usuarios/${usuarioAEliminar._id}`)
            .then((response) => {
                toast.success(response.data.message, {
                    autoClose: 1500,
                    hideProgressBar: true,
                });
                fetchUsuarios();
                setUsuarioAEliminar(null);
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
                            const jsonContent = result.data.map(usuario => ({
                                nombre: usuario.nombre,
                                apellido: usuario.apellido,
                                email: usuario.email,
                                fecha_registro: new Date(usuario.fecha_registro)
                            }));
                            axios.post('http://localhost:5000/usuarios', jsonContent)
                                .then(() => fetchUsuarios())
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
        fetchUsuarios(query ? `?${query}` : '');
    };

    return (
        <div className="container-clients">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="text-center">Usuarios</h1>

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
                                {['Codigo', 'ID', 'Nombre', 'Apellido', 'Email', 'Fecha de registro', 'Acciones'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario._id}>
                                    <td>{usuario.codigo}</td>
                                    <td>{usuario._id}</td>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.apellido}</td>
                                    <td>{usuario.email}</td>
                                    <td>{usuario.fecha_registro}</td>
                                    <td>
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(usuario)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {' '}
                                        <button type="button" className="btns btnDelete" onClick={() => setUsuarioAEliminar(usuario)} data-bs-toggle="modal" data-bs-target="#deleteModal">
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
                    title={isEdit ? "Editar Usuario" : "Crear Usuario"}
                    onSave={handleSave}
                >
                    <FormFields formData={formData} handleChange={handleFormChange} />
                </Modal>

                {/* Eliminar Modal */}
                <Modal
                    id="deleteModal"
                    title="Eliminar Usuario"
                    onSave={handleDeleteConfirm}
                    saveLabel="Eliminar"
                    saveClass="btn-danger"
                >
                    <p>¿Está seguro que desea eliminar el usuario?</p>
                </Modal>
            </div>
        </div>
    );
}

export default Usuarios;