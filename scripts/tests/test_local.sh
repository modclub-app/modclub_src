#!/bin/bash

export BYPASS_PROMPT_YES=yes
export DEV_ENV=qa
export ENV=qa
export OLD_MODCLUB_INSTANCE=la3yy-gaaaa-aaaah-qaiuq-cai
export NETWORK=local

EXPORT LEDGER_IDENTITY="qa_ledger_identity"
EXPORT PLEDGER_MINTER_IDENTITY="qa_ledger_minter"
EXPORT PROVIDER_IDENTITY="qa_test_provider"

function run_tests() {
	clear
	printf "${GREEN}[TEST] ${YELLOW}Modclub Tests started ...${NC}\n"

	source ./scripts/tests/security_test.sh
	source ./scripts/tests/ledger_tests.sh
	source ./scripts/tests/vesting_canister_tests.sh
	source ./scripts/tests/e2e_test.sh
}

source ./scripts/infra/up_infra.sh && run_tests

