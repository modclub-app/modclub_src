#!/bin/bash

clear
echo "Modclub Security-system test module"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

dfx identity use default
source ./scripts/up_test_infra.sh

function get_auth_canister_admins() {
	local AUTH_CANISTER_ADMINS=$(dfx canister call auth_qa getAdmins '()')
	echo "$AUTH_CANISTER_ADMINS"
}

# Check for AuthCanister
function check_auth_canister() {
	EMPTY_ADMINS_LIST="(variant { ok = vec {} })"
	local admins_list=$(get_auth_canister_admins)

	if [ "$admins_list" != "$EMPTY_ADMINS_LIST" ]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] ADMINS_LIST NOT EMPTY !!!${NC}\n"
		echo $admins_list
		echo $EMPTY_ADMINS_LIST
		source ./scripts/shutdown_test_infra.sh
		exit 1
	fi

	dfx identity new modclub_tests_admin && dfx identity use modclub_tests_admin
	local test_admin_principal=$(dfx identity get-principal)
	dfx identity use default
	dfx identity remove modclub_tests_admin

	dfx canister call auth_qa registerAdmin '( principal "'$test_admin_principal'" )'
	ADMINS_LIST_UPDATED='(
  variant {
    ok = vec {
      principal "'$test_admin_principal'";
    }
  },
)'
	local admins_list_updated=$(get_auth_canister_admins)

	if [ "$admins_list_updated" != "$ADMINS_LIST_UPDATED" ]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] ADMINS_LIST NOT UPDATED WITH NEW ADMIN !!!${NC}\n"
		echo $admins_list_updated
		echo $ADMINS_LIST_UPDATED
		source ./scripts/shutdown_test_infra.sh
		exit 1
	fi

	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} AUTH_CANISTER checks passed successfully.${NC}\n"
}


# Check for RSCanister
function check_rs_canister() {
	local rs_canister_id=$(dfx canister id rs_qa)
	local auth_subscribers=$(dfx canister call auth_qa getSubscriptions '()')
	local RS_SUBSCRIPTION_RECORD='record {
        topic = "admins";
        _actor = service "'$rs_canister_id'";
        consumer = principal "'$rs_canister_id'";
      };'

	if [[ "$auth_subscribers" != *"$RS_SUBSCRIPTION_RECORD"* ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] RS_CANISTER IS NOT SUBSCRIBED TO AUTH_CANISTER !!!${NC}\n"
		echo $auth_subscribers
		source ./scripts/shutdown_test_infra.sh
		exit 1
	fi

	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} RS_CANISTER checks passed successfully.${NC}\n"
}


# Check for WalletCanister
function check_wallet_canister() {
	local wallet_canister_id=$(dfx canister id wallet_qa)
	local auth_subscribers=$(dfx canister call auth_qa getSubscriptions '()')
	local WALLET_SUBSCRIPTION_RECORD='record {
        topic = "admins";
        _actor = service "'$wallet_canister_id'";
        consumer = principal "'$wallet_canister_id'";
      };'

	if [[ "$auth_subscribers" != *"$WALLET_SUBSCRIPTION_RECORD"* ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] WALLET_CANISTER IS NOT SUBSCRIBED TO AUTH_CANISTER !!!${NC}\n"
		echo $auth_subscribers
		source ./scripts/shutdown_test_infra.sh
		exit 1
	fi

	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} WALLET_CANISTER checks passed successfully.${NC}\n"
}

# Check for ModclubCanister
function check_modclub_canister() {
	local modclub_canister_id=$(dfx canister id modclub_qa)
	local auth_subscribers=$(dfx canister call auth_qa getSubscriptions '()')
	local MODCLUB_SUBSCRIPTION_RECORD='record {
        topic = "admins";
        _actor = service "'$modclub_canister_id'";
        consumer = principal "'$modclub_canister_id'";
      };'

	if [[ "$auth_subscribers" != *"$MODCLUB_SUBSCRIPTION_RECORD"* ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] MODCLUB_CANISTER IS NOT SUBSCRIBED TO AUTH_CANISTER !!!${NC}\n"
		echo $auth_subscribers
		source ./scripts/shutdown_test_infra.sh
		exit 1
	fi

	printf "${GREEN}[TEST] ${CYAN}[SUCCESS] ${GREEN} MODCLUB_CANISTER checks passed successfully.${NC}\n"
}


function run_testcases() {

	echo "Testcases started..."

	check_auth_canister
	check_rs_canister
	check_wallet_canister
	check_modclub_canister

}

run_testcases

source ./scripts/shutdown_test_infra.sh
