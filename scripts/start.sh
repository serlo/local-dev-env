#!/bin/bash

export $(grep -v '^#' .env | xargs)

trap compose_down INT

function compose_down() {
  echo 'stopping docker-compose'
  ./scripts/stop.sh
}

for service in $@; do
  compose_files="$compose_files -f docker/$service.yml"
done
echo $0
docker-compose -f docker/net.yml $compose_files up
