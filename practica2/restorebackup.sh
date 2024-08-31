#!/bin/bash

# Definir variables
DB_USER="root"
DB_PASS="Option65.la"
DB_NAME="practica2"
BACKUP_DIR="/home/alexcham23/Documentos/DB2/BD2S22024_Grupo_9/practica2/backup_full"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_log_${DATE}.txt"
# Registrar hora de inicio
echo "Inicio del backup full: $(date)" #>> $LOG_FILE

# Conectar a MySQL y borrar la base de datos 'practica2'
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS practica2;"

# Conectar a MySQL y crear la base de datos 'practica2'
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS practica2;"

mysql -u $DB_USER -p$DB_PASS $DB_NAME < "${BACKUP_DIR}/backup_dia2_completo.sql"

echo "Fin del backup full: $(date)" #>> $LOG_FILE
