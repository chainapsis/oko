#!/bin/bash

# Node 1

export MIGRATE_MODE=one
export NODE_ID=1

$(dirname "$0")/migrate.sh