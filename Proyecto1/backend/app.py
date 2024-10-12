from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

cluster = Cluster(['localhost'], port=9042)
session = cluster.connect('ventas_sa')

def str_to_uuid(val):
    return uuid.UUID(val)

def uuid_to_str(val):
    return str(val)

# ====================== SALUDO ENDPOINTS ======================

@app.route('/saludo', methods=['GET'])
def saludar():
    data = {'message': '¡Hola desde Flask!'}
    return jsonify(data), 201

# ===================== CLIENTES ENDPOINTS =====================

@app.route('/clientes', methods=['POST'])
def crear_cliente():
    data = request.json
    if type(data) == list:
        for cliente in data:
            codigo_cliente = uuid.uuid4()
            representante_legal = cliente['representante_legal']
            telefono = cliente['telefono']
            direccion = cliente['direccion']
            nombre_empresa = cliente['nombre_empresa']
            tipo_empresa = cliente['tipo_empresa']
            query = """
            INSERT INTO cliente (codigo_cliente, representante_legal, telefono, direccion, nombre_empresa, tipo_empresa)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            session.execute(query, (codigo_cliente, representante_legal, telefono, direccion, nombre_empresa, tipo_empresa))
    elif type(data) == dict:
        codigo_cliente = uuid.uuid4()
        representante_legal = data['representante_legal']
        telefono = data['telefono']
        direccion = data['direccion']
        nombre_empresa = data['nombre_empresa']
        tipo_empresa = data['tipo_empresa']
        query = """
        INSERT INTO cliente (codigo_cliente, representante_legal, telefono, direccion, nombre_empresa, tipo_empresa)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        session.execute(query, (codigo_cliente, representante_legal, telefono, direccion, nombre_empresa, tipo_empresa))
    return jsonify({"message": "Cliente(s) creado(s) exitosamente."}), 201

@app.route('/clientes', methods=['GET'])
def ver_clientes():
    query = "SELECT * FROM cliente"
    rows = session.execute(query)
    clientes = []
    for row in rows:
        clientes.append({
            "codigo_cliente": uuid_to_str(row.codigo_cliente),
            "representante_legal": row.representante_legal,
            "telefono": row.telefono,
            "direccion": row.direccion,
            "nombre_empresa": row.nombre_empresa,
            "tipo_empresa": row.tipo_empresa
        })
    return jsonify(clientes), 200

@app.route('/clientes/<codigo_cliente>', methods=['PUT'])
def actualizar_cliente(codigo_cliente):
    data = request.json
    representante_legal = data['representante_legal']
    telefono = data['telefono']
    direccion = data['direccion']
    nombre_empresa = data['nombre_empresa']
    tipo_empresa = data['tipo_empresa']
    query = """
    UPDATE cliente SET representante_legal=%s, telefono=%s, direccion=%s, nombre_empresa=%s, tipo_empresa=%s 
    WHERE codigo_cliente=%s
    """
    session.execute(query, (representante_legal, telefono, direccion, nombre_empresa, tipo_empresa, str_to_uuid(codigo_cliente)))
    return jsonify({"message": "Cliente actualizado exitosamente."}), 200

@app.route('/clientes/<codigo_cliente>', methods=['DELETE'])
def eliminar_cliente(codigo_cliente):
    query = "DELETE FROM cliente WHERE codigo_cliente=%s"
    session.execute(query, (str_to_uuid(codigo_cliente),))
    return jsonify({"message": "Cliente eliminado exitosamente."}), 200

# ===================== BODEGAS ENDPOINTS =====================

@app.route('/bodegas', methods=['POST'])
def crear_bodega():
    data = request.json
    if type(data) == list:
        for bodega in data:
            codigo_bodega = uuid.uuid4()
            capacidad_m3 = round(float(bodega['capacidad_m3']), 2)
            query = """
            INSERT INTO bodega (codigo_bodega, capacidad_m3)
            VALUES (%s, %s)
            """
            session.execute(query, (codigo_bodega, capacidad_m3))
    elif type(data) == dict:
        codigo_bodega = uuid.uuid4()
        capacidad_m3 = round(float(data['capacidad_m3']), 2)
        query = """
        INSERT INTO bodega (codigo_bodega, capacidad_m3)
        VALUES (%s, %s)
        """
        session.execute(query, (codigo_bodega, capacidad_m3))
    return jsonify({"message": "Bodega(s) creada(s) exitosamente."}), 201

@app.route('/bodegas', methods=['GET'])
def ver_bodegas():
    query = "SELECT * FROM bodega"
    rows = session.execute(query)
    bodegas = []
    for row in rows:
        bodegas.append({
            "codigo_bodega": uuid_to_str(row.codigo_bodega),
            "capacidad_m3": row.capacidad_m3
        })
    return jsonify(bodegas), 200

@app.route('/bodegas/<codigo_bodega>', methods=['PUT'])
def actualizar_bodega(codigo_bodega):
    data = request.json
    capacidad_m3 = round(float(data['capacidad_m3']), 2)
    query = """
    UPDATE bodega SET capacidad_m3=%s 
    WHERE codigo_bodega=%s
    """
    session.execute(query, (capacidad_m3, str_to_uuid(codigo_bodega)))
    return jsonify({"message": "Bodega actualizada exitosamente."}), 200

@app.route('/bodegas/<codigo_bodega>', methods=['DELETE'])
def eliminar_bodega(codigo_bodega):
    query = "DELETE FROM bodega WHERE codigo_bodega=%s"
    session.execute(query, (str_to_uuid(codigo_bodega),))
    return jsonify({"message": "Bodega eliminada exitosamente."}), 200

# =================== CUARTOS FRIOS ENDPOINTS ===================

@app.route('/cuartosfrios', methods=['POST'])
def crear_cuartofrio():
    data = request.json
    if type(data) == list:
        for cuartofrio in data:
            codigo_cuarto_frio = uuid.uuid4()
            capacidad_m3 = round(float(cuartofrio['capacidad_m3']), 2)
            temperatura = round(float(cuartofrio['temperatura']), 2)
            codigo_bodega = cuartofrio['codigo_bodega']
            query = """
            INSERT INTO cuarto_frio (codigo_cuarto_frio, capacidad_m3, temperatura, codigo_bodega)
            VALUES (%s, %s, %s, %s)
            """
            session.execute(query, (codigo_cuarto_frio, capacidad_m3, temperatura, str_to_uuid(codigo_bodega)))
    elif type(data) == dict:
        codigo_cuarto_frio = uuid.uuid4()
        capacidad_m3 = round(float(data['capacidad_m3']), 2)
        temperatura = round(float(data['temperatura']), 2)
        codigo_bodega = data['codigo_bodega']
        query = """
        INSERT INTO cuarto_frio (codigo_cuarto_frio, capacidad_m3, temperatura, codigo_bodega)
        VALUES (%s, %s, %s, %s)
        """
        session.execute(query, (codigo_cuarto_frio, capacidad_m3, temperatura, str_to_uuid(codigo_bodega)))
    return jsonify({"message": "Cuarto(s) frio(s) creado(s) exitosamente."}), 201

@app.route('/cuartosfrios/<codigo_bodega>', methods=['GET'])
def ver_cuartosfrios(codigo_bodega):
    query = "SELECT * FROM cuarto_frio WHERE codigo_bodega=" + uuid_to_str(codigo_bodega) + " ALLOW FILTERING"
    rows = session.execute(query)
    cuartos_frios = []
    for row in rows:
        cuartos_frios.append({
            "codigo_cuarto_frio": uuid_to_str(row.codigo_cuarto_frio),
            "capacidad_m3": row.capacidad_m3,
            "temperatura": row.temperatura,
            "codigo_bodega": row.codigo_bodega,
        })
    return jsonify(cuartos_frios), 200

@app.route('/cuartosfrios/<codigo_cuarto_frio>', methods=['PUT'])
def actualizar_cuartofrio(codigo_cuarto_frio):
    data = request.json
    capacidad_m3 = round(float(data['capacidad_m3']), 2)
    temperatura = round(float(data['temperatura']), 2)

    query = """
    UPDATE cuarto_frio SET capacidad_m3=%s, temperatura=%s
    WHERE codigo_cuarto_frio=%s
    """
    session.execute(query, (capacidad_m3, temperatura, str_to_uuid(codigo_cuarto_frio)))
    return jsonify({"message": "Cuarto frio actualizado exitosamente."}), 200

@app.route('/cuartosfrios/<codigo_cuarto_frio>', methods=['DELETE'])
def eliminar_cuartofrio(codigo_cuarto_frio):
    query = "DELETE FROM cuarto_frio WHERE codigo_cuarto_frio=%s"
    session.execute(query, (str_to_uuid(codigo_cuarto_frio),))
    return jsonify({"message": "Cuarto frio eliminado exitosamente."}), 200

# ===================== PRODUCTOS ENDPOINTS =====================

@app.route('/productos', methods=['POST'])
def crear_producto():
    data = request.json
    if type(data) == list:
        for producto in data:
            codigo_producto = uuid.uuid4()
            nombre = producto['nombre']
            marca = producto['marca']
            fabricante = producto['fabricante']
            precio_actual = round(float(producto['precio_actual']), 2)
            codigo_bodega = producto['codigo_bodega']
            query = """
            INSERT INTO producto (codigo_producto, nombre, marca, fabricante, precio_actual, codigo_bodega)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            session.execute(query, (codigo_producto, nombre, marca, fabricante, precio_actual, str_to_uuid(codigo_bodega)))
    elif type(data) == dict:
            codigo_producto = uuid.uuid4()
            nombre = data['nombre']
            marca = data['marca']
            fabricante = data['fabricante']
            precio_actual = round(float(data['precio_actual']), 2)
            codigo_bodega = data['codigo_bodega']
            query = """
            INSERT INTO producto (codigo_producto, nombre, marca, fabricante, precio_actual, codigo_bodega)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            session.execute(query, (codigo_producto, nombre, marca, fabricante, precio_actual, str_to_uuid(codigo_bodega)))
    return jsonify({"message": "Producto(s) creado(s) exitosamente."}), 201

@app.route('/productos/<codigo_bodega>', methods=['GET'])
def ver_productoenbodega(codigo_bodega):
    query = "SELECT * FROM producto WHERE codigo_bodega=" + uuid_to_str(codigo_bodega) + " ALLOW FILTERING"
    rows = session.execute(query)
    productos = []
    for row in rows:
        productos.append({
            "codigo_producto": uuid_to_str(row.codigo_producto),
            "nombre": row.nombre,
            "marca": row.marca,
            "fabricante": row.fabricante,
            "precio_actual": row.precio_actual
        })
    return jsonify(productos), 200

@app.route('/productos', methods=['GET'])
def ver_productos():
    query = "SELECT * FROM producto"
    rows = session.execute(query)
    productos = []
    for row in rows:
        productos.append({
            "codigo_producto": uuid_to_str(row.codigo_producto),
            "nombre": row.nombre,
            "marca": row.marca,
            "fabricante": row.fabricante,
            "precio_actual": row.precio_actual,
            "codigo_bodega": row.codigo_bodega
        })
    return jsonify(productos), 200

@app.route('/productos/<codigo_producto>', methods=['PUT'])
def actualizar_producto(codigo_producto):
    data = request.json
    nombre = data['nombre']
    marca = data['marca']
    fabricante = data['fabricante']
    precio_actual = round(float(data['precio_actual']), 2)
    precio_anterior = round(float(data['precio_anterior']), 2)
    fecha = data['fecha']

    # Actualizar el historial de precios
    query1 = "INSERT INTO precio_historial (codigo_precio_historial, fecha, precio, codigo_producto) "
    query1 += "VALUES (uuid(), '" + fecha + "', " + str(precio_anterior) + ", " + codigo_producto + ")"
    session.execute(query1)
    
    # Actualizar el producto
    query = """
    UPDATE producto SET nombre=%s, marca=%s, fabricante=%s, precio_actual=%s 
    WHERE codigo_producto=%s
    """
    session.execute(query, (nombre, marca, fabricante, precio_actual, str_to_uuid(codigo_producto)))
    return jsonify({"message": "Producto actualizado exitosamente."}), 200

@app.route('/productos/<codigo_producto>', methods=['DELETE'])
def eliminar_producto(codigo_producto):
    query = "DELETE FROM producto WHERE codigo_producto=%s"
    session.execute(query, (str_to_uuid(codigo_producto),))
    
    return jsonify({"message": "Producto eliminado exitosamente."}), 200

# ================ HISTORIAL PRECIOS ENDPOINTS ================

@app.route('/precioshistorial', methods=['POST'])
def crear_preciohistorial():
    data = request.json
    if type(data) == list:
        for preciohistorial in data:
            codigo_precio_historial = uuid.uuid4()
            fecha = datetime.strptime(preciohistorial['fecha'], "%d/%m/%Y %H:%M:%S")
            precio = round(float(preciohistorial['precio']), 2)
            codigo_producto = preciohistorial['codigo_producto']
            query = """
            INSERT INTO precio_historial (codigo_precio_historial, fecha, precio, codigo_producto)
            VALUES (%s, %s, %s, %s)
            """
            session.execute(query, (codigo_precio_historial, fecha, precio, str_to_uuid(codigo_producto)))
    elif type(data) == dict:
        codigo_precio_historial = uuid.uuid4()
        fecha = datetime.strptime(data['fecha'], "%d/%m/%Y %H:%M:%S")
        precio = round(float(data['precio']), 2)
        codigo_producto = data['codigo_producto']
        query = """
        INSERT INTO precio_historial (codigo_precio_historial, fecha, precio, codigo_producto)
        VALUES (%s, %s, %s, %s)
        """
        session.execute(query, (codigo_precio_historial, fecha, precio, str_to_uuid(codigo_producto)))
    return jsonify({"message": "precios(s) agregado(s) exitosamente."}), 201

@app.route('/precioshistorial/<codigo_producto>', methods=['GET'])
def ver_precioshisotorial(codigo_producto):
    query = "SELECT * FROM precio_historial WHERE codigo_producto=" + uuid_to_str(codigo_producto) + " ALLOW FILTERING"
    rows = session.execute(query)
    precios_historial = []
    for row in rows:
        precios_historial.append({
            "codigo_precio_historial": uuid_to_str(row.codigo_precio_historial),
            "fecha": row.fecha.strftime("%d/%m/%Y %H:%M:%S"),
            "precio": row.precio,
            "codigo_producto": row.codigo_producto,
        })
    return jsonify(precios_historial), 200

@app.route('/precioshistorial/<codigo_precio_historial>', methods=['PUT'])
def actualizar_preciohistorial(codigo_precio_historial):
    data = request.json
    fecha = datetime.strptime(data['fecha'], "%d/%m/%Y %H:%M:%S")
    precio = round(float(data['precio']), 2)
    query = """
    UPDATE precio_historial SET fecha=%s, precio=%s
    WHERE codigo_precio_historial=%s
    """
    session.execute(query, (fecha, precio, str_to_uuid(codigo_precio_historial)))
    return jsonify({"message": "precio actualizado exitosamente."}), 200

@app.route('/precioshistorial/<codigo_precio_historial>', methods=['DELETE'])
def eliminar_preciohistorial(codigo_precio_historial):
    query = "DELETE FROM precio_historial WHERE codigo_precio_historial=%s"
    session.execute(query, (str_to_uuid(codigo_precio_historial),))
    return jsonify({"message": "precio eliminado exitosamente."}), 200

# ===================== COMPRAS ENDPOINTS =====================

@app.route('/compras', methods=['GET'])
def ver_clientes_productos():
    query = "SELECT * FROM cliente"
    rows = session.execute(query)
    clientes = []
    for row in rows:
        clientes.append({
            "codigo_cliente": uuid_to_str(row.codigo_cliente),
            "representante_legal": row.representante_legal,
            "telefono": row.telefono,
            "direccion": row.direccion,
            "nombre_empresa": row.nombre_empresa,
            "tipo_empresa": row.tipo_empresa
        })
    query = "SELECT * FROM producto"
    rows = session.execute(query)
    productos = []
    for row in rows:
        productos.append({
            "codigo_producto": uuid_to_str(row.codigo_producto),
            "nombre": row.nombre,
            "marca": row.marca,
            "fabricante": row.fabricante,
            "precio_actual": row.precio_actual,
            "codigo_bodega": row.codigo_bodega
        })
    return jsonify({"clientes": clientes , "productos": productos}), 200

# ===================== PEDIDOS ENDPOINTS =====================

@app.route('/pedidos', methods=['POST'])
def crear_pedido():
    data = request.json
    codigo_pedido = uuid.uuid4()
    fecha = data['fecha']
    total = round(float(data['total']), 2)
    codigo_cliente = data['codigo_cliente']
    detalles = data['detalles']

    detalles_str = "["
    for detalle in detalles:
        detalles_str += "{nombre_producto: '" + detalle['nombre_producto'] + "', cantidad: " + str(detalle['cantidad']) + ", precio_unitario: " + str(detalle['precio_unitario']) + ", precio_total: " + str(detalle['precio_total']) + "}, "
    detalles_str = detalles_str[:-2] + "]"

    query = "INSERT INTO pedido (codigo_pedido, fecha, total, codigo_cliente, detalles) "
    query += "VALUES (uuid(), '" + fecha + "', " + str(total) + ", " + codigo_cliente + ", " + detalles_str + ")"
    session.execute(query)
    return jsonify({"message": "Pedido realizado exitosamente."}), 201

@app.route('/pedidos', methods=['GET'])
def ver_pedidos():
    query = "SELECT * FROM pedido"
    rows = session.execute(query)
    productos = []
    for row in rows:
        detalles_list = []
        for detalle in row.detalles:
            detalles_list.append({"nombre_producto": detalle.nombre_producto, "cantidad": str(detalle.cantidad), "precio_unitario": str(detalle.precio_unitario), "precio_total": str(detalle.precio_total)})
        query = "SELECT * FROM cliente WHERE codigo_cliente=" + uuid_to_str(row.codigo_cliente) + " ALLOW FILTERING"
        cliente = session.execute(query).one()
        productos.append({
            "codigo_pedido": uuid_to_str(row.codigo_pedido),
            "fecha": row.fecha.strftime("%d/%m/%Y %H:%M:%S"),
            "total": row.total,
            "nombre_empresa": cliente.nombre_empresa,
            "detalles": detalles_list
        })
    return jsonify(productos), 200

@app.route('/pedidos/<codigo_pedido>', methods=['GET'])
def ver_pedido(codigo_pedido):
    query = "SELECT * FROM pedido WHERE codigo_pedido=" + uuid_to_str(codigo_pedido) + " ALLOW FILTERING"
    pedido = session.execute(query).one()
    query = "SELECT * FROM cliente WHERE codigo_cliente=" + uuid_to_str(pedido.codigo_cliente) + " ALLOW FILTERING"
    cliente = session.execute(query).one()
    detalles_list = []
    subtotal = 0
    for detalle in pedido.detalles:
        detalles_list.append({"nombre_producto": detalle.nombre_producto, "cantidad": detalle.cantidad, "precio_unitario": round(float(detalle.precio_unitario), 2), "precio_total": round(float(detalle.precio_total), 2)})
        subtotal += round(float(detalle.precio_total), 2)
    descuento = 0
    descuento_porcentaje = 0
    if cliente.tipo_empresa == "A":
        descuento_porcentaje = 0.1
        descuento = subtotal * descuento_porcentaje
    elif cliente.tipo_empresa == "B":
        descuento_porcentaje = 0.05
        descuento = subtotal * descuento_porcentaje
    pedido_dict = {
        "codigo_pedido": uuid_to_str(pedido.codigo_pedido),
        "fecha": pedido.fecha.strftime("%d/%m/%Y %H:%M:%S"),
        "nombre_empresa": cliente.nombre_empresa,
        "representante_legal": cliente.representante_legal,
        "subtotal": round(float(subtotal), 2),
        "descuento": round(float(descuento), 2),
        "descuento_porcentaje": float(descuento_porcentaje),
        "total": round(float(pedido.total), 2),
        "detalles": detalles_list
    }
    return jsonify(pedido_dict), 200

@app.route('/pedidos/<codigo_pedido>', methods=['DELETE'])
def eliminar_pedido(codigo_pedido):
    query = "DELETE FROM pedido WHERE codigo_pedido=%s"
    session.execute(query, (str_to_uuid(codigo_pedido),))
    return jsonify({"message": "Pedido eliminado exitosamente."}), 200

if __name__ == '__main__':
    app.run(debug=True)