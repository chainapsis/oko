#!/bin/bash

act --workflows "../../.github/workflows/deploy_oko_apps.yml" \
    --input tag=develop/v0.0.1
    --secret-file .secrets \
    --var-file .vars \
    -s ACTIONS_STEP_DEBUG=true \
    --container-architecture linux/amd64
