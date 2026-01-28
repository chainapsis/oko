#!/bin/bash

act --workflows "../../.github/workflows/deploy_oko_apps.yml" \
    --secret-file .secrets \
    --var-file .vars \
    --container-architecture linux/amd64
