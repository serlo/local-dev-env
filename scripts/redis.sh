#!/bin/bash

docker compose -f docker/net.yml -f docker/api.yml exec redis redis-cli "$@"
