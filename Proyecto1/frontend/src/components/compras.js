import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Compras() {
    const [compras, setCompras] = useState({ clientes: [], productos: [] });
    const [cantidad, setCantidad] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedProducto, setSelectedProducto] = useState('');
    const [listaProductos, setListaProductos] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    const handleClienteChange = (event) => {
        setClienteSeleccionado(JSON.parse(event.target.value));
    };

    const fetchCompras = async () => {
        try {
            const response = await axios.get('http://localhost:5000/compras');
            setCompras(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchCompras();
    }, []);

    const handleProductoChange = (event) => {
        setSelectedProducto(event.target.value);
    };

    const handleCantidadChange = (event) => {
        setCantidad(Number(event.target.value));
    };

    const handleAgregarProducto = () => {
        if (!selectedProducto || cantidad <= 0) {
            toast.warn("Seleccione un producto y una cantidad válida.", {
                autoClose: 1500,
                hideProgressBar: true,
            });
            return;
        }

        const productoData = compras.productos.find(
            (producto) => producto.codigo_producto === selectedProducto
        );

        const nuevoProducto = {
            nombre_producto: productoData.nombre,
            cantidad,
            precio_unitario: productoData.precio_actual,
            precio_total: cantidad * productoData.precio_actual
        };

        setListaProductos([...listaProductos, nuevoProducto]);
        setSelectedProducto('');
        setCantidad(0);
    };

    const calculateSubtotal = useCallback(() => {
        return listaProductos.reduce((acc, producto) => acc + producto.precio_total, 0);
    }, [listaProductos]);

    const calculateDiscount = useCallback(() => {
        if (clienteSeleccionado?.tipo_empresa === 'A') return 0.1;
        if (clienteSeleccionado?.tipo_empresa === 'B') return 0.05;
        return 0;
    }, [clienteSeleccionado]);

    useEffect(() => {
        const newSubtotal = calculateSubtotal();
        const discount = calculateDiscount();
        setSubtotal(newSubtotal);
        setDescuento(discount);
        setTotal(newSubtotal - newSubtotal * discount);
    }, [listaProductos, clienteSeleccionado, calculateSubtotal, calculateDiscount]);

    const handleRealizarCompra = async () => {
        if (listaProductos.length === 0) {
            toast.warn("Agregue al menos un producto antes de realizar la compra.", {
                autoClose: 1500,
                hideProgressBar: true,
            });
            return;
        }

        const pedidoData = {
            fecha: new Date(),
            total,
            codigo_cliente: clienteSeleccionado?.codigo_cliente,
            detalles: listaProductos,
        };

        try {
            const response = await axios.post('http://localhost:5000/pedidos', pedidoData);
            toast.success(response.data.message, {
                autoClose: 1500,
                hideProgressBar: true,
            });
            setListaProductos([]);
        } catch (error) {
            console.error('Error creando el pedido:', error);
        }
    };

    const handleDelete = (index) => {
        const newProductos = [...listaProductos];
        newProductos.splice(index, 1);
        setListaProductos(newProductos);
    };


    return (
        <div className="container-compras">
            <div className="row">
                <div>
                    <ToastContainer />
                </div>

                <h1 className="col-10 offset-1 mb-3 text-center">Realizar Compra</h1>

                <div className="col-10 offset-1 mb-3">
                    <label className="form-label fw-bold">Cliente</label>
                    <select
                        className="form-select"
                        value={JSON.stringify(clienteSeleccionado) || ''}
                        onChange={handleClienteChange}
                    >
                        <option value="">Seleccionar cliente</option>
                        {compras.clientes.map((cliente) => (
                            <option key={cliente.codigo_cliente} value={JSON.stringify(cliente)}>
                                {`${cliente.nombre_empresa} - ${cliente.representante_legal}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-10 offset-1 mb-3">
                    <div className="row mb-3">
                        <div className="col-md-10">
                            <label className="form-label fw-bold">Producto</label>
                            <select
                                className="form-select"
                                value={selectedProducto}
                                onChange={handleProductoChange}
                            >
                                <option value="">Seleccionar producto</option>
                                {compras.productos.map((producto) => (
                                    <option key={producto.codigo_producto} value={producto.codigo_producto}>
                                        {`${producto.nombre} - Q${producto.precio_actual}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Cantidad</label>
                            <input
                                className="form-control"
                                type="number"
                                min="1"
                                value={cantidad}
                                onChange={handleCantidadChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-10 offset-1 mb-3 text-center">
                    <button className="btn btn-success" onClick={handleAgregarProducto}>Agregar Producto</button>
                </div>

                <div className="col-10 offset-1">
                    <table className="table mt-4 text-center">
                        <thead>
                            <tr>
                                {['Producto', 'Cantidad', 'Precio unitario', 'Precio total', 'Acciones'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {listaProductos.map((producto, index) => (
                                <tr key={index}>
                                    {['nombre_producto', 'cantidad', 'precio_unitario', 'precio_total'].map((field, idx) => (
                                        <td key={idx}>{field === 'precio_total' ? producto[field].toFixed(2) : producto[field]}</td>
                                    ))}
                                    <td>
                                        <button type="button" className="btns btnDelete" onClick={() => handleDelete(index)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="col-10 offset-1 text-end">
                    <p>Subtotal: <strong>Q{subtotal.toFixed(2)}</strong></p>
                    <p>Descuento: <strong>{(descuento * 100).toFixed(0)}%</strong></p>
                    <p>Total: <strong>Q{total.toFixed(2)}</strong></p>
                </div>

                <div className="col-10 offset-1 mb-3 text-center">
                    <button className="btn btn-primary" onClick={handleRealizarCompra}>Realizar Compra</button>
                </div>
            </div>
        </div>
    );
}

export default Compras;