#!/bin/bash

clear

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

source ./scripts/infra/up_infra.sh

function run_tests() {
	clear
	printf "${GREEN}[TEST] ${YELLOW}Modclub Tests started ...${NC}\n"

	source ./scripts/tests/security-test.sh
	source ./scripts/tests/ledger-tests.sh
	source ./scripts/tests/vesting-canister-tests.sh
	source ./scripts/tests/e2e-test.sh
}

run_tests

source ./scripts/tests/infra/shutdown_infra.sh
