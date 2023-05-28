#!/bin/bash

export $(grep -v '^#' .env | xargs)

for filename in docker/*.yml; do
  all_docker_compose_files="$all_docker_compose_files -f $filename"
done

service=$1

shift

docker-compose $all_docker_compose_files exec $service $@
