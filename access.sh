#!/bin/bash

SCRIPTS_FOLDER="scripts"

permission_granted=0

for file in "$SCRIPTS_FOLDER"/*.sh; do
    if [[ -x "$file" ]]; then
        permission_granted=1
        break
    fi
done

find "$SCRIPTS_FOLDER" -name "*.sh" -type f -exec chmod +x {} \;

if [[ "$1" == "&&" ]]; then
    shift

    while [[ "$1" != "" ]]; do
        if [[ -x "$SCRIPTS_FOLDER/$1" ]]; then
            "./$SCRIPTS_FOLDER/$1"
        else
            echo "The file $1 doesn't have execution permissions."
        fi
        shift
    done

    exit 0
fi

# Mostrar mensaje si los permisos de ejecución se han otorgado a los archivos de script
if [[ $permission_granted -eq 1 ]]; then
    echo "Access already granted."
fi
