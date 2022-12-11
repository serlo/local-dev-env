#!/bin/bash

export $(grep -v '^#' .env | xargs)

trap compose_down INT

function compose_down() {
   echo 'stopping docker-compose'
   ./stop.sh
}

while [[ $# -gt 0 ]]; do
  case $1 in
    -n|--no|--without)
      WITHOUT_SERVICES="$2"
      shift 2
      ;;
    -d|--detach)
      DETACH=-d
      shift
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

IFS=',' read -r -a WITHOUT_SERVICES <<< $WITHOUT_SERVICES

API_COMPOSE_FILE='-f compose/api.yml'
DB_LAYER_COMPOSE_FILE='-f compose/db-layer.yml'
# TODO: add --with-chat, since most probably rocket chat is not wanted
ROCKET_CHAT_COMPOSE_FILE='-f compose/rocket-chat.yml'

for service in "${WITHOUT_SERVICES[@]}"
do
  case $service in
    api)
      API_COMPOSE_FILE=
      ;;
    db-layer)
      DB_LAYER_COMPOSE_FILE=
      ;;
    rocket-chat)
      ROCKET_CHAT_COMPOSE_FILE=
      ;;
  esac
done

docker-compose -f docker-compose.yml $API_COMPOSE_FILE $DB_LAYER_COMPOSE_FILE $ROCKET_CHAT_COMPOSE_FILE up $DETACH
