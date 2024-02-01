#!/bin/bash

export $(grep -v '^#' .env | xargs)

for file in ./docker/*; do
  compose_files+="$compose_files -f $file"
done

docker compose $compose_files down --remove-orphans $@
