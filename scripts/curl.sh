#!/bin/bash

endpoint=$1

curl -X GET -H "Content-Type: application/json" "http://localhost:3000/api/${endpoint}"
