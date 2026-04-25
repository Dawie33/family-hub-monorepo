#!/bin/bash
# Creates multiple PostgreSQL databases from the POSTGRES_MULTIPLE_DATABASES env var
# Usage: POSTGRES_MULTIPLE_DATABASES=db1,db2,db3

set -e

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
  for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
      CREATE DATABASE "$db";
      GRANT ALL PRIVILEGES ON DATABASE "$db" TO "$POSTGRES_USER";
EOSQL
    echo "Database '$db' created."
  done
fi
