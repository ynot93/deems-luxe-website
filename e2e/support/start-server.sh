#!/bin/bash
# Starts the app against a freshly reset test database, leaving the dev database alone.
set -eu

bash scripts/db.sh start >/dev/null
PSQL="psql -h 127.0.0.1 -p 55433 -U deems -d postgres"
$PSQL -qc 'DROP DATABASE IF EXISTS deems_luxe_test WITH (FORCE)' </dev/null
$PSQL -qc 'CREATE DATABASE deems_luxe_test' </dev/null

exec pnpm exec next dev --port 3100
