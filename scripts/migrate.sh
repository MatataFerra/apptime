#!/bin/bash

# This script is used to migrate the database

# go to the prisma/migrations directory
cd prisma/migrations

# run one migration at a time
for migration in $(ls -d */); do
  # get the migration name
  migration_name=$(basename $migration)
  # run the migration
  echo "Running migration: $migration_name"
  # run the migration
  turso db shell apptimedb <./$migration_name/migration.sql

  # check if the migration was successful
  if [[ $? -eq 0 ]]; then
    echo "Migration $migration_name was successful"
  else
    echo "Migration $migration_name failed"
    exit 1
  fi
done
