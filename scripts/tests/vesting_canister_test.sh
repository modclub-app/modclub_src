#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function shut_down_gracefully() {
	local shutdown_reason=$1
	printf "${GREEN}[TEST] ${RED}[FAILED] ${shutdown_reason}\n"
	source ./scripts/tests/infra/shutdown_test_infra.sh
	exit 1
}

printf "${GREEN}[TEST] ${YELLOW}Modclub VestingCanister test module...${NC}\n"

dfx identity use default

# Check for stage_vesting_block on VestingCanister
function check_stage_vesting_block() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} Vesting_QA stage_vesting_block...${NC}\n"
	dfx identity use default
	dfx identity new qa_test_moderator
	dfx identity use qa_test_moderator
	declare TEST_J_MODERATOR_PRINCIPAL=$(dfx identity get-principal)
	dfx identity use default

	local assert_zero_balance="(0 : nat)"

  	local locked_before=$(dfx canister call vesting_qa locked_for '(record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" })')
	local stage_result1=$(dfx canister call vesting_qa stage_vesting_block '(record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" }, 10_000_000 )')
	local stage_result2=$(dfx canister call vesting_qa stage_vesting_block '(record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" }, 10_000_000 )')
	local locked_after=$(dfx canister call vesting_qa locked_for '(record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" })')

	dfx identity remove qa_test_moderator
	if [[ "$locked_before" != *"$assert_zero_balance"* || "$locked_after" == *"$assert_zero_balance"* ]]; then
		shut_down_gracefully "WRONG RESULT AFTER stage_vesting_block CALL: Locked before: $locked_before | Locked after: $locked_after"
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} Vesting_QA stage_vesting_block.${NC}\n"
	return 0;
}

# Check for stake on VestingCanister
function check_stake() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} Vesting_QA stake...${NC}\n"
	dfx identity use default
	dfx identity new qa_test_moderator
	dfx identity use qa_test_moderator
	declare TEST_J_MODERATOR_PRINCIPAL=$(dfx identity get-principal)
	dfx identity use default

	local assert_stake_result="(variant { ok = 1 : nat })"

	local stake_result=$(dfx canister call vesting_qa stake '(record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" }, 10_000_000 )')

	dfx identity remove qa_test_moderator
	if [[ "$stake_result" != *"$assert_stake_result"* ]]; then
		shut_down_gracefully "WRONG RESULT AFTER stake CALL: $stake_result"
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} Vesting_QA stake.${NC}\n"
	return 0;
}

function run_testcases() {

	echo "Testcases started..."

	check_stage_vesting_block &&
	check_stake &&
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} ALL VESTING_QA TESTS SUCCESSFULL.${NC}\n" ||
	printf "${GREEN}[TEST] ${RED}[FAILED] VESTING_QA TESTS Failed.\n"

}

run_testcases

