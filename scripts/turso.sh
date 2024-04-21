#!/bin/bash

migration_name="$1"

if [[ -z $migration_name ]]; then
  echo "Please provide a migration name"
  exit 1
fi

turso db shell apptimedb <./prisma/migrations/$migration_name/migration.sql
