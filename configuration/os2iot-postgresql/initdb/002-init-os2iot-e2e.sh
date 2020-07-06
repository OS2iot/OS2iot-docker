#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    create database "os2iot-e2e" with owner os2iot;
EOSQL
