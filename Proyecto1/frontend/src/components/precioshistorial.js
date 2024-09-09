import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { capitalize } from 'lodash';
import axios from 'axios';

const FormFields = ({ formData, handleChange }) => {
    const fields = ['fecha', 'precio'];
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

function PreciosHistorial() {

    const { codigo_producto } = useParams();
    const [precios, setPrecios] = useState([]);
    const [selectedPrecio, setSelectedPrecio] = useState(null);
    const [formData, setFormData] = useState({});
    const [precioAEliminar, setPrecioAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const fetchPrecios = useCallback(() => {
        axios.get(`http://localhost:5000/precioshistorial/${codigo_producto}`)
            .then(response => setPrecios(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, [codigo_producto]);

    useEffect(() => {
        fetchPrecios();
    }, [fetchPrecios]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {

        const form_data = { ...formData, codigo_producto };

        const request = isEdit
            ? axios.put(`http://localhost:5000/precioshistorial/${selectedPrecio.codigo_precio_historial}`, form_data)
            : axios.post('http://localhost:5000/precioshistorial', form_data);
        request.then((response) => {
            toast.success(response.data.message, {
                autoClose: 1500,
                hideProgressBar: true,
            });
            fetchPrecios();
            resetForm();
        }).catch(error => console.error('Error saving precio historial:', error));
    };

    const handleEditClick = (precio) => {
        setSelectedPrecio(precio);
        setFormData(precio);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedPrecio(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/precioshistorial/${precioAEliminar.codigo_precio_historial}`)
            .then((response) => {
                toast.success(response.data.message, {
                    autoClose: 1500,
                    hideProgressBar: true,
                });
                fetchPrecios();
                setPrecioAEliminar(null);
            })
            .catch(error => console.error('Error deleting precio historial:', error));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    jsonContent.forEach(item => {
                        item.codigo_producto = codigo_producto;
                    });
                    axios.post('http://localhost:5000/precioshistorial', jsonContent)
                        .then(() => fetchPrecios())
                        .catch(error => console.error('Error uploading file:', error));
                } catch (error) {
                    console.error('Invalid JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container-precios">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="text-center">Historial de Precios</h1>

                <div className="col-10 offset-1 mb-3">
                    <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#createModal">Crear</button>
                    {' '}
                    <label className="btn btn-primary">
                        Cargar
                        <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                </div>

                <div className="col-10 offset-1">
                    <table className="table table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                {['Codigo', 'Fecha', 'Precio', 'Acciones'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {precios.map(precio => (
                                <tr key={precio.codigo_precio_historial}>
                                    {['codigo_precio_historial', 'fecha', 'precio'].map((field, idx) => (
                                        <td key={idx}>{precio[field]}</td>
                                    ))}
                                    <td>
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(precio)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {" "}
                                        <button type="button" className="btns btnDelete" onClick={() => setPrecioAEliminar(precio)} data-bs-toggle="modal" data-bs-target="#deleteModal">
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
                title={isEdit ? "Editar Precio" : "Crear Precio"}
                onSave={handleSave}
            >
                <FormFields formData={formData} handleChange={handleFormChange} />
            </Modal>

            {/* Modal for Deleting */}
            <Modal
                id="deleteModal"
                title="Eliminar Precio"
                saveLabel="Eliminar"
                saveClass="btn-danger"
                onSave={handleDeleteConfirm}
            >
                <p>¿Estás seguro de que deseas eliminar este precio?</p>
            </Modal>
        </div>
    );
}

export default PreciosHistorial;
