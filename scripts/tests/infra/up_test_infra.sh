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
  dfx canister create wallet_qa &&
  dfx canister create rs_qa &&
  dfx canister create modclub_qa &&
  dfx canister create vesting_qa &&
  dfx canister create modclub_qa_assets &&
  printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters CREATED${NC}\n"
	return 0
}

function deploy_wallet_canister() {
	dfx identity use default && dfx identity new qa_ledger_minter && dfx identity use qa_ledger_minter
	local qa_minter_principal=$(dfx identity get-principal)
	dfx identity use default && dfx identity new qa_ledger_identity && dfx identity use qa_ledger_identity
	local qa_ledger_principal=$(dfx identity get-principal)
	dfx identity use default
  local env=$(get_local_canisters)

  dfx deploy wallet_qa  --argument="(record {
    env = $env;
    ledgerInit = record {
      initial_mints = vec { 
        record { account = record { owner = principal \"$qa_ledger_principal\"; }; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"-------------------------RESERVE\"}; amount = 367_500_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"-------------------------AIRDROP\"}; amount = 10_000_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"-----------------------MARKETING\"}; amount = 50_000_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"------------------------ADVISORS\"}; amount = 50_000_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"-------------------------PRESEED\"}; amount = 62_500_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"----------------------PUBLICSALE\"}; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"----------------------------SEED\"}; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$qa_ledger_principal\"; subaccount = opt blob \"----------------------------TEAM\"}; amount = 160_000_000_000_000; };
      };
      minting_account = record { owner = principal \"$qa_minter_principal\"; };
      ledger_account = record { owner = principal \"$qa_ledger_principal\"; };
      token_name = \"MODCLUB TEST TOKEN\";
      token_symbol = \"MODTEST\";
      decimals = 8;
      transfer_fee = 10_000;
    }}
  )"
  return 0;
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
	deploy_wallet_canister &&
  deploy_vesting_canister &&
  dfx deploy internet_identity &&
  dfx deploy rs_qa  --argument="($local_env)" &&
	dfx deploy modclub_qa  --argument="($local_env)" &&
  dfx generate rs_qa -v &&
  dfx generate modclub_qa -v &&
  dfx generate wallet_qa -v &&
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
