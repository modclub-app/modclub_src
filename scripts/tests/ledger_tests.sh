#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

printf "${GREEN}[TEST] ${YELLOW}Modclub ICRC Ledger test module...${NC}\n"

dfx identity use default

# Check for icrc1_name on WalletCanister
function check_token_name() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_name...${NC}\n"
	local assert_token_name='("MODCLUB TEST TOKEN")'
	local token_name=$(dfx canister call wallet_qa icrc1_name '()')

	if [[ "$token_name" != "$assert_token_name" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG TOKEN_NAME !!!${NC}\n"
		echo $token_name
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_name.${NC}\n"
	return 0;
}

# Check for icrc1_symbol on WalletCanister
function check_token_symbol() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_symbol...${NC}\n"
	local assert_token_symbol='("MODTEST")'
	local token_symbol=$(dfx canister call wallet_qa icrc1_symbol '()')

	if [[ "$token_symbol" != "$assert_token_symbol" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG TOKEN_SYMBOL !!!${NC}\n"
		echo $token_symbol
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_symbol.${NC}\n"
	return 0;
}

# Check for icrc1_decimals on WalletCanister
function check_token_decimals() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_decimals...${NC}\n"
	local assert_token_decimals='(6 : nat8)'
	local token_decimals=$(dfx canister call wallet_qa icrc1_decimals '()')

	if [[ "$token_decimals" != "$assert_token_decimals" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG TOKEN_DECIMALS !!!${NC}\n"
		echo $token_decimals
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_decimals.${NC}\n"
	return 0;
}

# Check for icrc1_fee on WalletCanister
function check_ledger_fee() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_fee...${NC}\n"
	local assert_fee='(10_000 : nat)'
	local fee=$(dfx canister call wallet_qa icrc1_fee '()')

	if [[ "$fee" != "$assert_fee" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG FEE !!!${NC}\n"
		echo $fee
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_fee.${NC}\n"
	return 0;
}

# Check for icrc1_total_supply on WalletCanister
function check_total_supply() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_total_supply...${NC}\n"
	local assert_total_supply='(1_000_000_000_000_000 : nat)'
	local total_supply=$(dfx canister call wallet_qa icrc1_total_supply '()')

	if [[ "$total_supply" != "$assert_total_supply" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG TOTAL_SUPPLY !!!${NC}\n"
		echo $total_supply
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_total_supply.${NC}\n"
	return 0;
}

# Check for icrc1_minting_account on WalletCanister
function check_minting_account() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_minting_account...${NC}\n"
	dfx identity use qa_ledger_minter
	local assert_minting_account=$(dfx identity get-principal)
	dfx identity use default
	local minting_account=$(dfx canister call wallet_qa icrc1_minting_account '()')

	if [[ "$minting_account" != *"$assert_minting_account"* ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG MINTING_ACCOUNT !!!${NC}\n"
		echo $minting_account
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_minting_account.${NC}\n"
	return 0;
}

# Check for ledger_ballance on WalletCanister
function check_ledger_ballance() {
	printf "${GREEN}[TEST] ${YELLOW}[LEDGER_BALLANCE_CHECK] ${GREEN} WALLET_QA check preminted ballance on Ledger account...${NC}\n"
	dfx identity use qa_ledger_identity
	local ledger_account=$(dfx identity get-principal)
	dfx identity use default
	local assert_ballance="(100_000_000_000_000 : nat)"
	local ledger_account_ballance=$(dfx canister call wallet_qa icrc1_balance_of '(record { owner = principal "'$ledger_account'" })')
	local assert_reserve_ballance="(367_500_000_000_000 : nat)"
	local ledger_reserve_ballance=$(dfx canister call wallet_qa icrc1_balance_of '(record { owner = principal "'$ledger_account'"; subaccount = opt blob "-------------------------RESERVE"})')

	if [[ "$ledger_account_ballance" != "$assert_ballance" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG PREMINTED_BALLANCE for LEDGER_ACCOUNT !!!${NC}\n"
		echo $ledger_account_ballance
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi

	if [[ "$ledger_reserve_ballance" != "$assert_reserve_ballance" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER HAS WRONG PREMINTED_BALLANCE ON RESERVE SUBACCOUNT !!!${NC}\n"
		echo $ledger_reserve_ballance
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi

	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA check preminted ballance on Ledger account.${NC}\n"
	return 0;
}

# Check for icrc1_transfer on WalletCanister
function check_transfer() {
	printf "${GREEN}[TEST] ${YELLOW}[CANISTER_METHOD_CHECK] ${GREEN} WALLET_QA icrc1_transfer...${NC}\n"
	dfx identity use default && dfx identity new qa_test_alice && dfx identity use qa_test_alice
	local test_alice_account=$(dfx identity get-principal)
	dfx identity use qa_ledger_identity
	local ledger_account=$(dfx identity get-principal)

	local assert_transfer_result="variant { Ok = "
	local transfer_result=$(dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal "'$test_alice_account'" }; amount = 100_000 } )')

	if [[ "$transfer_result" != *"$assert_transfer_result"* ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] ICRC1_TRANSFER METHOD DOESNT WORK PROPERLY !!!${NC}\n"
		echo $transfer_result
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi

	local assert_alice_ballance="(100_000 : nat)"
	local alice_account_ballance=$(dfx canister call wallet_qa icrc1_balance_of '(record { owner = principal "'$test_alice_account'" })')
	if [[ "$alice_account_ballance" != "$assert_alice_ballance" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] ICRC1_TRANSFER METHOD DOESNT WORK PROPERLY, ALICE BALLANCE IS WRONG !!!${NC}\n"
		echo $alice_account_ballance
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi

	local assert_ledger_new_ballance="(99_999_999_890_000 : nat)"
	local ledger_account_ballance=$(dfx canister call wallet_qa icrc1_balance_of '(record { owner = principal "'$ledger_account'" })')
	if [[ "$ledger_account_ballance" != "$assert_ledger_new_ballance" ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] ICRC1_TRANSFER METHOD DOESNT WORK PROPERLY, LEDGER BALLANCE IS WRONG !!!${NC}\n"
		echo $ledger_account_ballance
		source ./scripts/tests/infra/shutdown_test_infra.sh
		exit 1
	fi

	dfx identity use default
	dfx identity remove qa_test_alice

	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_QA icrc1_transfer.${NC}\n"
	return 0;
}

function run_testcases() {

	echo "Testcases started..."

	check_token_name &&
	check_token_symbol &&
	check_token_decimals &&
	check_ledger_fee &&
	check_total_supply &&
	check_minting_account &&
	check_ledger_ballance &&
	check_transfer &&
	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} ALL WALLET_QA TESTS SUCCESSFULL.${NC}\n"

}

run_testcases

