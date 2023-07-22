#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Modclub test infra START ...${NC}\n"

# Prepare test infra
function create_qa_canisters() {
  printf  "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Creating QA Canisters...${NC}\n"
	dfx identity use default
  dfx canister create internet_identity &&
  dfx canister create auth_qa &&
  dfx canister create rs_qa &&
  dfx canister create modclub_qa &&
  dfx canister create vesting_qa &&
  dfx canister create modclub_qa_assets &&
  printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters CREATED${NC}\n"
	return 0
}

function get_local_canisters() {
  echo "record { modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; old_modclub_canister_id = principal \"t6rzw-2iaaa-aaaaa-aaama-cai\"; rs_canister_id = principal \"$(dfx canister id rs_qa)\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa)\"; auth_canister_id = principal \"$(dfx canister id auth_qa)\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa)\"; }"
}

function deploy_vesting_canister() {
	dfx identity use default
  local env=$(get_local_canisters)
  dfx deploy vesting_qa  --argument="(record { env = $env } )"
  return 0;
}

# Deploy AuthCanister
function deploy_qa_canisters() {
  export DEV_ENV=qa
  local local_env=$(get_local_canisters)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy QA Canisters...${NC}\n"

	dfx deploy auth_qa --argument="($local_env)" &&
  deploy_vesting_canister &&
  dfx deploy internet_identity &&
  dfx deploy rs_qa  --argument="($local_env)" &&
	dfx deploy modclub_qa  --argument="($local_env)" &&
  dfx generate rs_qa -v &&
  dfx generate modclub_qa -v &&
  dfx generate vesting_qa -v &&
  DEV_ENV=qa dfx deploy modclub_qa_assets &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters DEPLOYED${NC}\n"
	return 0;
}

# Run init
function init_qa_canisters() {
  printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Init QA Canisters...${NC}\n"
  dfx canister call modclub_qa adminInit &&
  dfx canister call modclub_qa configurePohForProvider "(principal \"$(dfx canister id modclub_qa)\", vec {\"challenge-user-audio\";\"challenge-user-video\"}, 365, false)" &&
  dfx canister call modclub_qa populateChallenges
  printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters INITIALIZED${NC}\n"
  return 0;
}

create_qa_canisters && deploy_qa_canisters && init_qa_canisters
