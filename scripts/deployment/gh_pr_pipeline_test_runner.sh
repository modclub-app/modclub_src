#!/bin/bash

set -e
set -x

# Add the test script that will execute within the PR pipeline
./scripts/tests/vesting_canister_test.sh
./scripts/tests/e2e_test.sh
./scripts/tests/archive_test/archive_test.sh