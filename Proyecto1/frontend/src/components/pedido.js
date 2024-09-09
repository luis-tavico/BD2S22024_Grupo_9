import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { capitalize } from 'lodash';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Pedido() {

    const { codigo_pedido } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedido = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/pedidos/${codigo_pedido}`);
                setPedido(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchPedido();
    }, [codigo_pedido]);

    const downloadPDF = () => {
        const input = document.getElementById('container-pedido');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`pedido_${codigo_pedido}.pdf`);
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <h2 className="text-center mt-5">Cargando...</h2>
            </div>
        );
    }

    if (!pedido) {
        return <h2 className="text-center mt-5">No se encontró el pedido</h2>;
    }

    return (
        <div className="container mt-4" id="container-pedido">
            <div className="card shadow-lg mb-4">
                <div className="card-header bg-primary text-white text-center">
                    <h1>Pedido {pedido.codigo_pedido}</h1>
                </div>
                <div className="card-body" id="pedido-content">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h5 className="text-primary">Información del Pedido</h5>
                            <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}</p>
                            <p><strong>Subtotal:</strong> Q{pedido.subtotal.toFixed(2)}</p>
                        </div>
                        <div className="col-md-6 text-end">
                            <h5 className="text-primary">Cliente</h5>
                            <p><strong>Nombre del Cliente:</strong> {pedido.nombre_empresa}</p>
                            <p><strong>Representante Legal:</strong> {pedido.representante_legal}</p>
                        </div>
                    </div>

                    <table className="table table-bordered border-secondary text-center shadow-sm">
                        <thead className="bg-light">
                            <tr>
                                {['Producto', 'Cantidad', 'Precio unitario', 'Precio total'].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pedido.detalles?.map((detalle, idx) => (
                                <tr key={idx}>
                                    <td>{detalle.nombre_producto}</td>
                                    <td>{detalle.cantidad}</td>
                                    <td>Q{detalle.precio_unitario.toFixed(2)}</td>
                                    <td>Q{detalle.precio_total.toFixed(2)}</td>
                                </tr>
                            ))}
                            {['subtotal', 'descuento', 'total'].map((field) => (
                                <tr key={field}>
                                    <td colSpan="2"></td>
                                    <th className="text-end">{capitalize(field)}</th>
                                    <td className="text-start">Q{pedido[field].toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="row mt-4">
                        <div className="col-md-6">
                            <p>*Se aplicó un descuento del {(pedido.descuento_porcentaje) * 100}%.</p>
                        </div>
                        <div className="col-md-6 text-end">
                            <button className="btn btn-primary" onClick={downloadPDF}>Descargar PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pedido;