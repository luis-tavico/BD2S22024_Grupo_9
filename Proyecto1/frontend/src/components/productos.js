import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import axios from 'axios';

const FormFields = ({ formData, handleChange }) => {
    const fields = ['nombre', 'marca', 'fabricante', 'precio_actual', 'codigo_bodega'];
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

function Productos() {

    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [formData, setFormData] = useState({});
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = () => {
        axios.get('http://localhost:5000/productos')
            .then(response => setProductos(response.data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = () => {
        const request = isEdit
            ? axios.put(`http://localhost:5000/productos/${selectedProducto.codigo_producto}`, formData)
            : axios.post('http://localhost:5000/productos', formData);
        request.then((response) => {
            toast.success(response.data.message, {
                autoClose: 1500,
                hideProgressBar: true,
            });
            fetchProductos();
            resetForm();
        }).catch(error => console.error('Error saving producto:', error));
    };

    const handleEditClick = (producto) => {
        setSelectedProducto(producto);
        setFormData(producto);
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedProducto(null);
        setFormData({});
        setIsEdit(false);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/productos/${productoAEliminar.codigo_producto}`)
            .then((response) => {
                toast.success(response.data.message, {
                    autoClose: 1500,
                    hideProgressBar: true,
                });
                fetchProductos();
                setProductoAEliminar(null);
            })
            .catch(error => console.error('Error deleting producto:', error));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    axios.post('http://localhost:5000/productos', jsonContent)
                        .then(() => fetchProductos())
                        .catch(error => console.error('Error uploading file:', error));
                } catch (error) {
                    console.error('Invalid JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container-productos">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="text-center">Productos</h1>

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
                                {['Codigo', 'Nombre', 'Marca', 'Fabricante', 'Precio actual', 'Historial de precios', 'Acciones'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map(producto => (
                                <tr key={producto.codigo_producto}>
                                    {['codigo_producto', 'nombre', 'marca', 'fabricante', 'precio_actual'].map((field, idx) => (
                                        <td key={idx}>{producto[field]}</td>
                                    ))}
                                    <td>
                                        <button type="button" className="btns btnHistory" onClick={() => navigate(`/precioshistorial/${producto.codigo_producto}`)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </td>
                                    <td>
                                        <button type="button" className="btns btnEdit" onClick={() => handleEditClick(producto)} data-bs-toggle="modal" data-bs-target="#createModal">
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        {" "}
                                        <button type="button" className="btns btnDelete" onClick={() => setProductoAEliminar(producto)} data-bs-toggle="modal" data-bs-target="#deleteModal">
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
                title={isEdit ? "Editar Producto" : "Crear Producto"}
                onSave={handleSave}
            >
                <FormFields formData={formData} handleChange={handleFormChange} />
            </Modal>

            {/* Modal for Deleting */}
            <Modal
                id="deleteModal"
                title="Eliminar Producto"
                saveLabel="Eliminar"
                saveClass="btn-danger"
                onSave={handleDeleteConfirm}
            >
                <p>¿Estás seguro de que deseas eliminar este producto?</p>
            </Modal>
        </div>
    );

}

export default Productos;