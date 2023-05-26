#!/bin/bash

# Obtener la ruta actual del script
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


endpoint=$1
params=''
shift


while getopts ":p:" opt; do
  case $opt in
    p)
      params=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "The option -$OPTARG require an argument. For example userId=12" >&2
      exit 1
      ;;
  esac
done

shift $((OPTIND - 1))

if [[ -z "$endpoint" ]]; then
    echo "The endpoint can't be empty."
    exit 1
fi

url="http://localhost:3000/api/${endpoint}"

if [[ -n "$params" ]]; then
  url+="?$params"
fi

response=$(curl -s -H "Content-Type: application/json" "$url")
echo "URL: $url"
echo "$response"
