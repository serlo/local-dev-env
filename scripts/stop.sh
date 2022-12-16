#!/bin/bash

for file in ./compose/*; do
  compose_files+="$compose_files -f $file"
done

docker-compose -f docker-compose.yml $compose_files down --remove-orphans
