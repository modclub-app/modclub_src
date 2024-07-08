#!/bin/bash

clear

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color


function run_tests() {
	clear
	printf "${GREEN}[TEST] ${YELLOW}Modclub Tests started ...${NC}\n"

	source ./scripts/tests/security_test.sh
	source ./scripts/tests/ledger_tests.sh
	source ./scripts/tests/vesting_canister_tests.sh
	source ./scripts/tests/e2e_test.sh
}

source ./scripts/infra/up_infra.sh && run_tests

source ./scripts/tests/infra/shutdown_infra.sh
