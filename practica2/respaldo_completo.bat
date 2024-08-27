@echo off
echo %date% %time%
mysql -u root -padmin123 -e "CREATE DATABASE IF NOT EXISTS practica2;"
mysqldump.exe -u root -padmin123 practica2 > "C:\Users\LUIS T\Desktop\Respaldo\backup_dia3_completo.sql"
echo %date% %time%

