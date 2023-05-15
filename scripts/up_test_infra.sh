#!/bin/bash

printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Modclub test infra START ...${NC}\n"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Prepare test infra
function create_qa_canisters() {
  printf  "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Creating QA Canisters...${NC}\n"
  dfx canister create auth_qa && dfx canister create wallet_qa && dfx canister create rs_qa && dfx canister create modclub_qa && printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters CREATED${NC}\n"
	return 0
}

# Deploy AuthCanister
function deploy_qa_canisters() {
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy QA Canisters...${NC}\n"
	dfx deploy auth_qa --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"
  dfx deploy wallet_qa  --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"
  dfx deploy rs_qa  --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"
	dfx deploy modclub_qa  --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters DEPLOYED${NC}\n"
	return 0
}

create_qa_canisters && deploy_qa_canisters
