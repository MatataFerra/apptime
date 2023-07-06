#!/bin/bash

# Obtener la ruta actual del script
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

endpoint=$1
user_id=''
get_profile=false
get_shift=false
no_params_routes=("user" "session")
shift

if [ -z $endpoint ]; then
  echo "=========================================="
  echo "Usage: yarn curl <endpoint> [-u userId] [-p] [-s]"
  echo "Example: yarn curl user -u 1 -p -s"
  echo ""
  echo "Available options:"
  echo "  -u userId     Sets the user ID."
  echo "  -p            Get the user's profile."
  echo "  -s            Get the user's shift."
  exit 0
fi

while getopts ":u:psh" opt; do
  case $opt in
  u)
    user_id=$OPTARG
    ;;
  p)
    get_profile=true
    ;;
  s)
    get_shift=true
    ;;
  h)
    echo "=========================================="
    echo "Usage: yarn curl <endpoint> [-u userId] [-p] [-s]"
    echo "Example: yarn curl user -u 1 -p -s"
    echo ""
    echo "Available options:"
    echo "  -u userId     Sets the user ID."
    echo "  -p            Get the user's profile."
    echo "  -s            Get the user's shift."
    exit 0
    ;;

  \?)
    echo "Invalid option: -$OPTARG" >&2
    exit 1
    ;;
  esac
done

shift $((OPTIND - 1))

url="http://localhost:3000/api/${endpoint}"

if [[ ! " ${no_params_routes[*]} " =~ " ${endpoint} " ]]; then
  echo "=========================================="
  echo "Please put the user ID with the -u option."
  echo "Example: yarn curl shift -u 1"
  exit 0
fi

if [[ "$endpoint" == "session" ]]; then
  echo "=========================================="
  echo "You try to get the session with this script."
  echo "/$endpoint endpoint for the URL: $url is not working for now."
  echo "please use the **Browser** NOT Postman or Insomnia."
  exit 0
fi

if [[ -n "$user_id" ]]; then
  url+="?userId=$user_id"
fi

if [[ "$get_profile" = true ]]; then
  if [[ "$url" == *"?"* ]]; then
    url+="&profile=true"
  else
    url+="?profile=true"
  fi
fi

if [[ "$get_shift" = true ]]; then
  if [[ "$url" == *"?"* ]]; then
    url+="&shifts=true"
  else
    url+="?shifts=true"
  fi
fi

response=$(curl -s -H "Content-Type: application/json" "$url" | json_pp -json_opt pretty,canonical)
echo "URL: $url"
echo "$response"
