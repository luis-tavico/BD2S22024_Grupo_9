import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


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

function Pedidos() {

    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [pedidoAEliminar, setPedidoAEliminar] = useState(null);

    useEffect(() => {
        fetchPedidos();
    }, []);

    const fetchPedidos = () => {
        axios.get('http://localhost:5000/pedidos')
            .then(response => setPedidos(response.data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:5000/pedidos/${pedidoAEliminar.codigo_pedido}`)
            .then((response) => {
                toast.success(response.data.message, {
                    autoClose: 1500,
                    hideProgressBar: true,
                });
                fetchPedidos();
                setPedidoAEliminar(null);
            })
            .catch(error => console.error('Error deleting pedido:', error));
    };

    return (
        <div className="container-pedidos">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="col-10 offset-1 mb-3 text-center">Pedidos</h1>

                <div className="col-10 offset-1">
                    <table className="table table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                {['Codigo', 'Cliente', 'Detalles', 'Acciones'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr key={pedido.codigo_pedido}>
                                    {['codigo_pedido', 'nombre_empresa'].map((field, idx) => (
                                        <td key={idx}>{pedido[field]}</td>
                                    ))}
                                    <td>
                                        <button type="button" className="btns btnHistory" onClick={() => navigate(`/pedidos/${pedido.codigo_pedido}`)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </td>
                                    <td>
                                        <button type="button" className="btns btnDelete" onClick={() => setPedidoAEliminar(pedido)} data-bs-toggle="modal" data-bs-target="#deleteModal">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Deleting */}
            <Modal
                id="deleteModal"
                title="Eliminar Pedido"
                saveLabel="Eliminar"
                saveClass="btn-danger"
                onSave={handleDeleteConfirm}
            >
                <p>¿Estás seguro de que deseas eliminar este pedido?</p>
            </Modal>
        </div>
    );

}

export default Pedidos;