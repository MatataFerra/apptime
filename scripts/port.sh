#!/bin/bash

# Verificar si se proporcionó el puerto como argumento
if [ $# -ne 1 ]; then
  echo "Please provide a port"
  echo "Usage: bash $0 <port>"
  exit 1
fi

port="$1"

# Verificar si el puerto es un número válido
if ! [[ "$port" =~ ^[0-9]+$ ]]; then
  echo "Invalid port number: $port"
  exit 1
fi

# Buscar el proceso en el puerto especificado
pid=$(sudo ss -lptn "sport = :$port" | grep -oP 'pid=\K\d+')

if [ -z "$pid" ]; then
  echo "No process found on port $port"
  exit 1
fi

echo "Proccess with port: $port -> $pid"
