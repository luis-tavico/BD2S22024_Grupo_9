from flask import Flask, jsonify
import pymysql
import pandas as pd

app = Flask(__name__)

# Conexion a la base de datos en MySQL
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='admin123',
    database='practica2',
    cursorclass=pymysql.cursors.DictCursor
)

@app.route('/')
def index():
    return 'Bienvenido a la API de la Practica 2'

# Cargar datos a modelo
@app.route('/cargarHabitaciones', methods=['GET'])
def cargar_habitaciones():
    try:
        # Cargar habitaciones en la base de datos
        df_pacientes = pd.read_csv('[BD2]Carga/Habitaciones.csv', delimiter=',')
        with connection.cursor() as cursor:
            for index, row in df_pacientes.iterrows():
                idHabitacion = row['idHabitacion']
                habitacion = row['habitacion']
                sql = "INSERT INTO HABITACION (idHabitacion, nombre) VALUES (%s, %s)"
                cursor.execute(sql, (idHabitacion, habitacion))
            connection.commit()
        return jsonify({'message': 'Datos cargados correctamente.'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Cargar datos a modelo
@app.route('/cargarPacientes', methods=['GET'])
def cargar_pacientes():
    try:
        # Cargar pacientes en la base de datos
        df_pacientes = pd.read_csv('[BD2]Carga/Pacientes.csv', delimiter=',')
        with connection.cursor() as cursor:
            for index, row in df_pacientes.iterrows():
                id_paciente = row['idPaciente']
                edad = row['edad']
                genero = row['genero']
                sql = "INSERT INTO PACIENTE (idPaciente, edad, genero) VALUES (%s, %s, %s)"
                cursor.execute(sql, (id_paciente, edad, genero))
            connection.commit()
        return jsonify({'message': 'Datos cargados correctamente.'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Cargar datos a modelo
@app.route('/cargarLogActividad1', methods=['GET'])
def cargar_log_actividad_1():
    try:
        # Cargar logs de actividades en la base de datos
        df_logActividad = pd.read_csv('[BD2]Carga/LogActividades1.csv', delimiter=',')
        with connection.cursor() as cursor:
            for index, row in df_logActividad.iterrows():
                timestamp = row['timestamp']
                actividad = row['actividad']
                idHabitacion = row['idHabitacion']
                idPaciente = row['idPaciente']
                sql = "INSERT INTO LOG_ACTIVIDAD (timestampx, actividad, PACIENTE_idPaciente, HABITACION_idHabitacion) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (timestamp, actividad, idPaciente, idHabitacion))
            connection.commit()
        return jsonify({'message': 'Datos cargados correctamente.'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Cargar datos a modelo
@app.route('/cargarLogActividad2', methods=['GET'])
def cargar_log_actividad_2():
    try:
        # Cargar logs de actividades en la base de datos
        df_logActividad = pd.read_csv('[BD2]Carga/LogActividades2.csv', delimiter=',')
        with connection.cursor() as cursor:
            for index, row in df_logActividad.iterrows():
                timestamp = row['timestamp']
                actividad = row['actividad']
                idHabitacion = row['idHabitacion']
                idPaciente = row['idPaciente']
                sql = "INSERT INTO LOG_ACTIVIDAD (timestampx, actividad, PACIENTE_idPaciente, HABITACION_idHabitacion) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (timestamp, actividad, idPaciente, idHabitacion))
            connection.commit()
        return jsonify({'message': 'Datos cargados correctamente.'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Cargar datos a modelo
@app.route('/cargarLogHabitacion', methods=['GET'])
def cargar_log_habitacion():
    try:
        # Cargar logs de habitaciones en la base de datos
        df_logHabitacion = pd.read_csv('[BD2]Carga/LogHabitacion.csv', delimiter=',')
        with connection.cursor() as cursor:
            for index, row in df_logHabitacion.iterrows():
                idHabitacion = row['idHabitacion']
                timestamp = row['timestamp']
                status = row['status']
                sql = "INSERT INTO LOG_HABITACION (timestampx, statusx, idHabitacion) VALUES (%s, %s, %s)"
                cursor.execute(sql, (timestamp, status, idHabitacion))
            connection.commit()
        return jsonify({'message': 'Datos cargados correctamente.'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)