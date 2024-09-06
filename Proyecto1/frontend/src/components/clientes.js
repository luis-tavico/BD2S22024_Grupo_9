import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { capitalize } from 'lodash';
import axios from 'axios';

const FormFields = ({ formData, handleChange }) => {
    const fields = ['representante_legal', 'telefono', 'direccion', 'nombre_empresa', 'tipo_empresa'];
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

function Clientes() {

    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [formData, setFormData] = useState({});
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = () => {
        axios.get('http://localhost:5000/clientes')
            .then(response => setClientes(response.data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {

        const request = isEdit
            ? axios.put(`http://localhost:5000/clientes/${selectedCliente.codigo_cliente}`, formData)
            : axios.post('http://localhost:5000/clientes', formData);

        request.then(() => {
            fetchClientes();
            resetForm();
        }).catch(error => console.error('Error saving cliente:', error));
    };

    const handleEditClick = (cliente) => {
        setSelectedCliente(cliente);
        setFormData(cliente);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedCliente(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/clientes/${clienteAEliminar.codigo_cliente}`)
            .then(() => {
                fetchClientes();
                setClienteAEliminar(null);
            })
            .catch(error => console.error('Error deleting cliente:', error));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    axios.post('http://localhost:5000/clientes', jsonContent)
                        .then(() => fetchClientes())
                        .catch(error => console.error('Error uploading file:', error));
                } catch (error) {
                    console.error('Invalid JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container-clients">
            <div className="row">
                <h1 className="text-center">Clientes</h1>

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
                                {['Codigo', 'Representante legal', 'Telefono', 'Direccion', 'Nombre empresa', 'Tipo empresa', 'Acciones'].map((header) => (
                                    <th className="text-center" key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map(cliente => (
                                <tr key={cliente.codigo_cliente}>
                                    {['codigo_cliente', 'representante_legal', 'telefono', 'direccion', 'nombre_empresa', 'tipo_empresa'].map((field, idx) => (
                                        <td className="text-center" key={idx}>{cliente[field]}</td>
                                    ))}
                                    <td className="text-center">
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(cliente)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {" "}
                                        <button type="button" className="btns btnDelete" onClick={() => setClienteAEliminar(cliente)} data-bs-toggle="modal" data-bs-target="#deleteModal">
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
                title={isEdit ? "Editar Cliente" : "Crear Cliente"}
                onSave={handleSave}
            >
                <FormFields formData={formData} handleChange={handleFormChange} />
            </Modal>

            {/* Modal for Deleting */}
            <Modal
                id="deleteModal"
                title="Eliminar Cliente"
                saveLabel="Eliminar"
                saveClass="btn-danger"
                onSave={handleDeleteConfirm}
            >
                <p>¿Estás seguro de que deseas eliminar este cliente?</p>
            </Modal>
        </div>
    );

}

export default Clientes;