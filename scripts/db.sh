#!/bin/bash
# Project-only Postgres, kept apart from any other database on this machine.
# Port 55433 because a Windows service already holds 5433.
set -eu

PGBIN=$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)
ROOT="$HOME/.local/share/deems-luxe"
PORT=55433

case "${1:-start}" in
  start)
    mkdir -p "$ROOT/run"
    if [ ! -d "$ROOT/pg" ]; then
      "$PGBIN/initdb" -D "$ROOT/pg" -U deems --auth=trust --encoding=UTF8 --no-locale >/dev/null
    fi
    if ! "$PGBIN/pg_isready" -q -h 127.0.0.1 -p "$PORT"; then
      setsid nohup "$PGBIN/pg_ctl" -D "$ROOT/pg" \
        -o "-p $PORT -k $ROOT/run -c listen_addresses=127.0.0.1" \
        -l "$ROOT/pg.log" -w start </dev/null >/dev/null 2>&1
    fi
    "$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U deems -d postgres -Atc \
      "SELECT 1 FROM pg_database WHERE datname='deems_luxe'" </dev/null | grep -q 1 \
      || "$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U deems -d postgres -c "CREATE DATABASE deems_luxe" </dev/null
    "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PORT"
    ;;
  stop)
    "$PGBIN/pg_ctl" -D "$ROOT/pg" stop
    ;;
  *)
    echo "Usage: db.sh start|stop" >&2
    exit 1
    ;;
esac
