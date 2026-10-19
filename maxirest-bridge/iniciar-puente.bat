@echo off
title MaxiRest Bridge - MambaQR
color 0b

echo ===================================================
echo     INICIANDO PUENTE MAXIREST - MAMBA QR
echo ===================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] Instalando dependencias por primera vez...
    call npm install
    echo.
)

echo [INFO] Iniciando agente puente...
echo.
call npx ts-node src/index.ts

pause
