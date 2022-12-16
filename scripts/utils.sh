#!/bin/bash

function error() {
  log "ERROR: $@"
  exit 1
}

function print_header() {
  echo
  log "=== $@ ==="
}

function log() {
  echo "${BOLD}$@${NORMAL}"
}

function current_timestamp() {
  date "+%s"
}
