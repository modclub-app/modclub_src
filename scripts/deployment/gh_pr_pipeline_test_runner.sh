#!/bin/bash

set -e
set -x

# Add the test script that will execute within the PR pipeline
./scripts/tests/vesting_canister_test.sh