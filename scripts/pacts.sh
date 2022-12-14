#!/bin/bash

source scripts/utils.sh

function init() {
  set -e
  trap 'tear_down' EXIT

  setup_mysql
  setup_server
}

function main() {
  yarn pacts
}

function tear_down() {
  kill_cargo_background_process
}

init
main
