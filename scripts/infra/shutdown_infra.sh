#!/bin/bash

printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Modclub test infra Shutdown ...${NC}\n"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check for AuthCanister
function stop_and_remove_canister() {
		printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Stop&Remove QA Canisters ...${NC}\n"
		dfx identity use default
		dfx canister stop modclub_qa && dfx canister delete modclub_qa
		dfx canister stop modclub_qa_assets && dfx canister delete modclub_qa_assets
		dfx canister stop wallet_qa && dfx canister delete wallet_qa && dfx identity remove qa_ledger_identity && dfx identity remove qa_ledger_minter
		dfx canister stop rs_qa && dfx canister delete rs_qa
		dfx canister stop auth_qa && dfx canister delete auth_qa
		dfx canister stop vesting_qa && dfx canister delete vesting_qa
		dfx canister stop internet_identity && dfx canister delete internet_identity
		dfx canister stop airdrop_qa && dfx canister delete airdrop_qa

		printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters removed.${NC}\n"
}

stop_and_remove_canister