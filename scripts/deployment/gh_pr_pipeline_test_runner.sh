#!/bin/bash

set -e
set -x

# Add the test script that will execute within the PR pipeline
./scripts/tests/vesting_canister_test.sh
./scripts/tests/e2e_test.sh
./scripts/tests/archive_test/archive_test.sh
./scripts/tests/secrets_test.sh
./scripts/tests/decideid_test/sanity_test.sh
./scripts/tests/decideid_test/ic_assets_test.sh