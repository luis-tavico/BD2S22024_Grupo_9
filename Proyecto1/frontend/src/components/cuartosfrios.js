import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { capitalize } from 'lodash';
import axios from 'axios';

const FormFields = ({ formData, handleChange }) => {
    const fields = ['capacidad_m3', 'temperatura'];
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

function CuartosFrios() {

    const { codigo_bodega } = useParams();
    const [cuartosFrios, setCuartosFrios] = useState([]);
    const [selectedCuartoFrio, setSelectedCuartoFrio] = useState(null);
    const [formData, setFormData] = useState({});
    const [cuartoFrioAEliminar, setCuartoFrioAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const fetchCuartosFrios = useCallback(() => {
        axios.get(`http://localhost:5000/cuartosfrios/${codigo_bodega}`)
            .then(response => setCuartosFrios(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, [codigo_bodega]);

    useEffect(() => {
        fetchCuartosFrios();
    }, [fetchCuartosFrios]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {

        const form_data = { ...formData, codigo_bodega };

        const request = isEdit
            ? axios.put(`http://localhost:5000/cuartosfrios/${selectedCuartoFrio.codigo_cuarto_frio}`, form_data)
            : axios.post('http://localhost:5000/cuartosfrios', form_data);

        request.then(() => {
            fetchCuartosFrios();
            resetForm();
        }).catch(error => console.error('Error saving cuarto frio:', error));
    };

    const handleEditClick = (cuartofrio) => {
        setSelectedCuartoFrio(cuartofrio);
        setFormData(cuartofrio);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedCuartoFrio(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/cuartosfrios/${cuartoFrioAEliminar.codigo_cuarto_frio}`)
            .then(() => {
                fetchCuartosFrios();
                setCuartoFrioAEliminar(null);
            })
            .catch(error => console.error('Error deleting cuarto frio:', error));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    jsonContent.forEach(item => {
                        item.codigo_bodega = codigo_bodega;
                    });
                    axios.post('http://localhost:5000/cuartosfrios', jsonContent)
                        .then(() => fetchCuartosFrios())
                        .catch(error => console.error('Error uploading file:', error));
                } catch (error) {
                    console.error('Invalid JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container-cuartosfrios">
            <div className="row">
                <h1 className="text-center">Cuartos Frios</h1>

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
                                {['Codigo', 'Capacidad m3', 'Temperatura', 'Acciones'].map((header) => (
                                    <th className="text-center" key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cuartosFrios.map(cuartofrio => (
                                <tr key={cuartofrio.codigo_cuarto_frio}>
                                    {['codigo_cuarto_frio', 'capacidad_m3', 'temperatura'].map((field, idx) => (
                                        <td className="text-center" key={idx}>{cuartofrio[field]}</td>
                                    ))}
                                    <td className="text-center">
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(cuartofrio)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {" "}
                                        <button type="button" className="btns btnDelete" onClick={() => setCuartoFrioAEliminar(cuartofrio)} data-bs-toggle="modal" data-bs-target="#deleteModal">
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
                title={isEdit ? "Editar Cuarto Frio" : "Crear Cuarto Frio"}
                onSave={handleSave}
            >
                <FormFields formData={formData} handleChange={handleFormChange} />
            </Modal>

            {/* Modal for Deleting */}
            <Modal
                id="deleteModal"
                title="Eliminar Cuarto Frio"
                saveLabel="Eliminar"
                saveClass="btn-danger"
                onSave={handleDeleteConfirm}
            >
                <p>¿Estás seguro de que deseas eliminar este cuarto frio?</p>
            </Modal>
        </div>
    );

}

export default CuartosFrios;