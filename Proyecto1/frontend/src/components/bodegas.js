import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import axios from 'axios';

const FormFields = ({ formData, handleChange }) => {
    const fields = ['capacidad_m3'];
    return fields.map((field) => (
        <div className="form-group" key={field}>
            <label>{capitalize(field.replace('_', ' '))}</label>
            <input
                type="text"
                className="form-control"
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
            />
        </div>
    ));
};

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


function Bodegas() {

    const navigate = useNavigate();
    const [bodegas, setBodegas] = useState([]);
    const [selectedBodega, setSelectedBodega] = useState(null);
    const [formData, setFormData] = useState({});
    const [bodegaAEliminar, setBodegaAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchBodegas();
    }, []);

    const fetchBodegas = () => {
        axios.get('http://localhost:5000/bodegas')
            .then(response => setBodegas(response.data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {
        const request = isEdit
            ? axios.put(`http://localhost:5000/bodegas/${selectedBodega.codigo_bodega}`, formData)
            : axios.post('http://localhost:5000/bodegas', formData);

        request.then(() => {
            fetchBodegas();
            resetForm();
        }).catch(error => console.error('Error saving bodega:', error));
    };

    const handleEditClick = (bodega) => {
        setSelectedBodega(bodega);
        setFormData(bodega);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedBodega(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/bodegas/${bodegaAEliminar.codigo_bodega}`)
            .then(() => {
                fetchBodegas();
                setBodegaAEliminar(null);
            })
            .catch(error => console.error('Error deleting bodega:', error));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    axios.post('http://localhost:5000/bodegas', jsonContent)
                        .then(() => fetchBodegas())
                        .catch(error => console.error('Error uploading file:', error));
                } catch (error) {
                    console.error('Invalid JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container-bodegas">
            <div className="row">
                <h1 className="text-center">Bodegas</h1>

                <div className="col-10 offset-1 mb-3">
                    <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#createModal">Crear</button>
                    {' '}
                    <label className="btn btn-primary">
                        Cargar
                        <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                </div>

                <div className="col-10 offset-1">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                {['Codigo', 'Capacidad m3', 'Cuartos frios', 'Productos', 'Acciones'].map((header) => (
                                    <th className="text-center" key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bodegas.map(bodega => (
                                <tr key={bodega.codigo_bodega}>
                                    {['codigo_bodega', 'capacidad_m3'].map((field, idx) => (
                                        <td className="text-center" key={idx}>{bodega[field]}</td>
                                    ))}
                                    <td className="text-center">
                                        <button type="button" className="btns btnHistory" onClick={() => navigate(`/cuartosfrios/${bodega.codigo_bodega}`)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button type="button" className="btns btnHistory" onClick={() => navigate(`/productos/${bodega.codigo_bodega}`)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(bodega)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {" "}
                                        <button type="button" className="btns btnDelete" onClick={() => setBodegaAEliminar(bodega)} data-bs-toggle="modal" data-bs-target="#deleteModal">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Creating/Editing */}
            <Modal
                id="createModal"
                title={isEdit ? "Editar Bodega" : "Crear Bodega"}
                onSave={handleSave}
            >
                <FormFields formData={formData} handleChange={handleFormChange} />
            </Modal>

            {/* Modal for Deleting */}
            <Modal
                id="deleteModal"
                title="Eliminar Bodega"
                saveLabel="Eliminar"
                saveClass="btn-danger"
                onSave={handleDeleteConfirm}
            >
                <p>¿Estás seguro de que deseas eliminar esta bodega?</p>
            </Modal>
        </div>
    );
}

export default Bodegas;