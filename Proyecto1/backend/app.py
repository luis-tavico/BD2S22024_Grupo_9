from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

cluster = Cluster(['172.17.0.2'])
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
            capacidad_m3 = float(bodega['capacidad_m3'])
            query = """
            INSERT INTO bodega (codigo_bodega, capacidad_m3)
            VALUES (%s, %s)
            """
            session.execute(query, (codigo_bodega, capacidad_m3))
    elif type(data) == dict:
        codigo_bodega = uuid.uuid4()
        capacidad_m3 = float(data['capacidad_m3'])
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
            "capacidad_m3": str(row.capacidad_m3)
        })
    return jsonify(bodegas), 200

@app.route('/bodegas/<codigo_bodega>', methods=['PUT'])
def actualizar_bodega(codigo_bodega):
    data = request.json
    capacidad_m3 = float(data['capacidad_m3'])
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
            capacidad_m3 = float(cuartofrio['capacidad_m3'])
            temperatura = float(cuartofrio['temperatura'])
            codigo_bodega = cuartofrio['codigo_bodega']
            query = """
            INSERT INTO cuarto_frio (codigo_cuarto_frio, capacidad_m3, temperatura, codigo_bodega)
            VALUES (%s, %s, %s, %s)
            """
            session.execute(query, (codigo_cuarto_frio, capacidad_m3, temperatura, str_to_uuid(codigo_bodega)))
    elif type(data) == dict:
        codigo_cuarto_frio = uuid.uuid4()
        capacidad_m3 = float(data['capacidad_m3'])
        temperatura = float(data['temperatura'])
        codigo_bodega = data['codigo_bodega']
        query = """
        INSERT INTO cuarto_frio (codigo_cuarto_frio, capacidad_m3, temperatura, codigo_bodega)
        VALUES (%s, %s, %s, %s)
        """
        session.execute(query, (codigo_cuarto_frio, capacidad_m3, temperatura, str_to_uuid(codigo_bodega)))
    return jsonify({"message": "Cuarto(s) frio(s) creada(s) exitosamente."}), 201

@app.route('/cuartosfrios/<codigo_bodega>', methods=['GET'])
def ver_cuartosfrios(codigo_bodega):
    query = "SELECT * FROM cuarto_frio WHERE codigo_bodega=" + uuid_to_str(codigo_bodega) + " ALLOW FILTERING"
    rows = session.execute(query)
    cuartos_frios = []
    for row in rows:
        cuartos_frios.append({
            "codigo_cuarto_frio": uuid_to_str(row.codigo_cuarto_frio),
            "capacidad_m3": str(row.capacidad_m3),
            "temperatura": str(row.temperatura),
            "codigo_bodega": str(row.codigo_bodega),
        })
    return jsonify(cuartos_frios), 200

@app.route('/cuartosfrios/<codigo_cuarto_frio>', methods=['PUT'])
def actualizar_cuartofrio(codigo_cuarto_frio):
    data = request.json
    capacidad_m3 = float(data['capacidad_m3'])
    temperatura = float(data['temperatura'])

    query = """
    UPDATE cuarto_frio SET capacidad_m3=%s, temperatura=%s
    WHERE codigo_cuarto_frio=%s
    """
    session.execute(query, (capacidad_m3, temperatura, str_to_uuid(codigo_cuarto_frio)))
    return jsonify({"message": "Cuarto frio actualizada exitosamente."}), 200

@app.route('/cuartosfrios/<codigo_cuarto_frio>', methods=['DELETE'])
def eliminar_cuartofrio(codigo_cuarto_frio):
    query = "DELETE FROM cuarto_frio WHERE codigo_cuarto_frio=%s"
    session.execute(query, (str_to_uuid(codigo_cuarto_frio),))
    return jsonify({"message": "Cuarto frio eliminada exitosamente."}), 200

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
            precio_actual = float(producto['precio_actual'])
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
            precio_actual = float(data['precio_actual'])
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
            "nombre": str(row.nombre),
            "marca": str(row.marca),
            "fabricante": str(row.fabricante),
            "precio_actual": str(row.precio_actual)
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
            "nombre": str(row.nombre),
            "marca": str(row.marca),
            "fabricante": str(row.fabricante),
            "precio_actual": str(row.precio_actual),
            "codigo_bodega": str(row.codigo_bodega)
        })
    return jsonify(productos), 200

@app.route('/productos/<codigo_producto>', methods=['PUT'])
def actualizar_producto(codigo_producto):
    data = request.json
    nombre = data['nombre']
    marca = data['marca']
    fabricante = data['fabricante']
    precio_actual = float(data['precio_actual'])
    
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
            fecha = preciohistorial['fecha']
            precio = float(preciohistorial['precio'])
            codigo_producto = preciohistorial['codigo_producto']
            query = """
            INSERT INTO precio_historial (codigo_precio_historial, fecha, precio, codigo_producto)
            VALUES (%s, %s, %s, %s)
            """
            session.execute(query, (codigo_precio_historial, fecha, precio, str_to_uuid(codigo_producto)))
    elif type(data) == dict:
        codigo_precio_historial = uuid.uuid4()
        fecha = data['fecha']
        precio = float(data['precio'])
        codigo_producto = data['codigo_producto']
        query = """
        INSERT INTO precio_historial (codigo_precio_historial, fecha, precio, codigo_producto)
        VALUES (%s, %s, %s, %s)
        """
        session.execute(query, (codigo_precio_historial, fecha, precio, str_to_uuid(codigo_producto)))
    return jsonify({"message": "Historial de precios creado(s) exitosamente."}), 201

@app.route('/precioshistorial/<codigo_producto>', methods=['GET'])
def ver_precioshisotorial(codigo_producto):
    query = "SELECT * FROM precio_historial WHERE codigo_producto=" + uuid_to_str(codigo_producto) + " ALLOW FILTERING"
    rows = session.execute(query)
    precios_historial = []
    for row in rows:
        precios_historial.append({
            "codigo_precio_historial": uuid_to_str(row.codigo_precio_historial),
            "fecha": str(row.fecha),
            "precio": str(row.precio),
            "codigo_producto": str(row.codigo_producto),
        })
    return jsonify(precios_historial), 200

@app.route('/precioshistorial/<codigo_precio_historial>', methods=['PUT'])
def actualizar_preciohistorial(codigo_precio_historial):
    data = request.json
    fecha = data['fecha']
    precio = float(data['precio'])

    query = """
    UPDATE precio_historial SET fecha=%s, precio=%s
    WHERE codigo_precio_historial=%s
    """
    session.execute(query, (fecha, precio, str_to_uuid(codigo_precio_historial)))
    return jsonify({"message": "Historial de precios actualizado exitosamente."}), 200

@app.route('/precioshistorial/<codigo_precio_historial>', methods=['DELETE'])
def eliminar_preciohistorial(codigo_precio_historial):
    query = "DELETE FROM precio_historial WHERE codigo_precio_historial=%s"
    session.execute(query, (str_to_uuid(codigo_precio_historial),))
    return jsonify({"message": "Historial de precios eliminado exitosamente."}), 200

# ===================== PEDIDOS ENDPOINTS =====================

if __name__ == '__main__':
    app.run(debug=True)