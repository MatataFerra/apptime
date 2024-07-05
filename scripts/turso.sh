#!/bin/bash

migration_name="$1"

if [[ -z $migration_name ]]; then
  echo "Please provide a migration name"
  exit 1
fi

migration_file="./prisma/migrations/$migration_name/migration.sql"
if [ ! -f "$migration_file" ]; then
  echo "Migration file does not exist: $migration_file"
  exit 1
fi

turso db shell apptimedb <./prisma/migrations/$migration_name/migration.sql

# Find last-migrations-done.txt file or create it and register the migration with the date
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
ROOT_DIR="$(dirname "$DIR")"
FILE="last-migrations-done.txt"
FILE_PATH="$ROOT_DIR/$FILE"
MIGRATION_DONE_NAME="$migration_name"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

if [ ! -f "$FILE_PATH" ]; then
  touch "$FILE_PATH"
  echo "File created on: $FILE_PATH"
fi

echo "$MIGRATION_DONE_NAME | $DATE" >>"$FILE_PATH"
echo "Migration registered on: $FILE"
