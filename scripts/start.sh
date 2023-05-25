#!/bin/bash

export $(grep -v '^#' .env | xargs)

trap compose_down INT

function compose_down() {
  echo 'stopping docker-compose'
  ./scripts/stop.sh
  return
}

for arg; do
  shift
  [ "$arg" = "-d" ] && detach="-d" && continue
  set -- "$@" "$arg"
done

for service in $@; do
  compose_files="$compose_files -f docker/$service.yml"
done

docker-compose -f docker/net.yml $compose_files up "$detach"
