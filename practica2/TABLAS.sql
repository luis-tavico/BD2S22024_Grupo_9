CREATE DATABASE IF NOT EXISTS practica2;
USE practica2;

-- Crear las tablas según el modelo entidad-relación proporcionado
CREATE TABLE HABITACION (
    idHabitacion INT PRIMARY KEY NOT NULL,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE PACIENTE (
    idPaciente INT PRIMARY KEY NOT NULL,
	edad INT NOT NULL
);

CREATE TABLE LOG_ACTIVIDAD (
    id_log_actividad INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    timestampx VARCHAR(100),
    actividad VARCHAR(500),
    PACIENTE_idPaciente INT NOT NULL,
    HABITACION_idHabitacion INT NOT NULL,
    FOREIGN KEY (PACIENTE_idPaciente) REFERENCES PACIENTE(idPaciente),
    FOREIGN KEY (HABITACION_idHabitacion) REFERENCES HABITACION(idHabitacion)
);
    
CREATE TABLE LOG_HABITACION(
	timestampx VARCHAR(100) PRIMARY KEY NOT NULL,
    statusx VARCHAR(45) NOT NULL,
    idHabitacion INT NOT NULL,
    FOREIGN KEY (idHabitacion) REFERENCES HABITACION(idHabitacion)
);

ALTER TABLE PACIENTE ADD genero VARCHAR(20) NOT NULL;