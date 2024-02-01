#!/bin/bash

export $(grep -v '^#' .env | xargs)

for filename in docker/*.yml; do
  all_docker_compose_files="$all_docker_compose_files -f $filename"
done

docker compose $all_docker_compose_files "$@"
