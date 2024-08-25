#!/bin/bash

# Definir variables
DB_USER="root"
#DB_PASS="la"
DB_NAME="practica2"
BACKUP_DIR="/home/alexcham23/Documentos/DB2/practica2/backup_full"
INCREMENTAL_DIR="/home/alexcham23/Documentos/DB2/practica2/backup_incremental"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_log_${DATE}.txt"
# Registrar hora de inicio
echo "Inicio del backup full: $(date)" >> $LOG_FILE
# Realizar backup completo
mysqldump -u $DB_USER -p --all-databases --single-transaction --flush-logs --routines --triggers --events > "${BACKUP_DIR}/backup_full_${DATE}.sql"

echo "Fin del backup full: $(date)" >> $LOG_FILE
echo "Inicio del backup incremental: $(date)" >> $LOG_FILE
# Realizar backup incremental (usa binlog)
mysqlbinlog --start-datetime="$(date -d '-1 day' +'%Y-%m-%d %H:%M:%S')" /var/lib/mysql/binlog.[0-9]* > "${INCREMENTAL_DIR}/backup_incremental_${DATE}.sql"
echo "fin del backup incremental: $(date)" >> $LOG_FILE



