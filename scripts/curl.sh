#!/bin/bash

# Obtener la ruta actual del script
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


endpoint=$1

if [[ -z "$endpoint" ]]; then
    echo "El endpoint no puede estar vacío."
    exit 1
fi

curl -H "Content-Type: application/json" "http://localhost:3000/api/${endpoint}"

# Asignar permisos de ejecución al archivo
chmod +x "${SCRIPT_PATH}/curl.sh"
