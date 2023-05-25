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
  dfx canister create auth_qa && dfx canister create wallet_qa && dfx canister create rs_qa && dfx canister create modclub_qa && printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters CREATED${NC}\n"
	return 0
}

function deploy_wallet_canister() {
	dfx identity use default && dfx identity new qa_ledger_minter && dfx identity use qa_ledger_minter
	local qa_minter_principal=$(dfx identity get-principal)
	dfx identity use default && dfx identity new qa_ledger_identity && dfx identity use qa_ledger_identity
	local qa_ledger_principal=$(dfx identity get-principal)
	dfx identity use default

  dfx deploy wallet_qa  --argument="(record {
    env = variant { local = record {
      modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";
      rs_canister_id = principal \"$(dfx canister id rs_qa)\";
      wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";
      auth_canister_id = principal \"$(dfx canister id auth_qa)\";
    }};
    ledgerInit = record {
      initial_mints = vec { record { account = record { owner = principal \"$qa_ledger_principal\"; }; amount = 10_000_000_000_000; }; };
      minting_account = record { owner = principal \"$qa_minter_principal\"; };
      token_name = \"MODCLUB TEST TOKEN\";
      token_symbol = \"MODTEST\";
      decimals = 6;
      transfer_fee = 10_000;
    }}
  )"
}

# Deploy AuthCanister
function deploy_qa_canisters() {

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy QA Canisters...${NC}\n"
	dfx deploy auth_qa --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"

	deploy_wallet_canister

  dfx deploy rs_qa  --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"
	dfx deploy modclub_qa  --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub_qa)\";wallet_canister_id = principal \"$(dfx canister id wallet_qa)\";rs_canister_id = principal \"$(dfx canister id rs_qa)\";auth_canister_id = principal \"$(dfx canister id auth_qa)\";}})"
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters DEPLOYED${NC}\n"
	return 0
}

create_qa_canisters && deploy_qa_canisters
