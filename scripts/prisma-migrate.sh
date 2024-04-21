#!/bin/bash

# Obtener la ruta actual del script
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "SCRIPT_PATH: ${SCRIPT_PATH}/prisma-migrate.sh"

# Cargar variables de entorno desde el archivo .env.development
if [[ -f "${SCRIPT_PATH}/../.env.local" ]]; then
  export $(cat "${SCRIPT_PATH}/../.env.local" | xargs)
fi

# Verificar si se proporcionó un argumento (nombre de migración)
if [[ $# -eq 0 ]]; then
  echo "Please provide a migration name"
  exit 1
fi

# Ejecutar migración en Prisma
npx prisma migrate dev --name "$1"
