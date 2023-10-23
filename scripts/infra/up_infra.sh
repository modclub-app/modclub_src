#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

current_dir="$(dirname "$0")"
ROOT_DIR="$current_dir/../../"

source "${ROOT_DIR}/scripts/utils.sh"
source "${ROOT_DIR}/scripts/seeds/add_token.sh"
source "${ROOT_DIR}/scripts/seeds/gen_content.sh"
source "${ROOT_DIR}/scripts/seeds/gen_provider.sh"


LEDGER_IDENTITY="qa_ledger_identity"
PROVIDER_IDENTITY="qa_test_provider"

read -p "Press any key to continue..."


printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Modclub test infra START ...${NC}\n"

# Prepare test infra
function create_qa_canisters() {
  printf  "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Creating QA Canisters...${NC}\n"
	dfx identity use default
  dfx canister create internet_identity &&
  dfx canister create auth_qa &&
  dfx canister create wallet_qa &&
  dfx canister create wallet_dev &&
  dfx canister create rs_qa &&
  dfx canister create modclub_qa &&
  dfx canister create vesting_qa &&
  dfx canister create modclub_qa_assets &&
  dfx canister create airdrop_qa &&
  printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters CREATED${NC}\n"
	return 0
}

function deploy_wallet_canister() {
  dfx identity use default 
	if ! dfx identity use qa_ledger_minter >/dev/null 2>&1; then
		dfx identity new qa_ledger_minter --disable-encryption
		dfx identity use qa_ledger_minter
	fi

  local qa_minter_principal=$(dfx identity get-principal)
	if ! dfx identity use $LEDGER_IDENTITY >/dev/null 2>&1; then
		dfx identity new $LEDGER_IDENTITY --disable-encryption
		dfx identity use $LEDGER_IDENTITY
	fi
  local qa_ledger_principal=$(dfx identity get-principal)
  dfx identity use default

  local ARCHIVE_CONTROLLER=$(dfx identity get-principal)
  local TOKEN_NAME="Modclub_test_token"
  local TOKEN_SYMBOL=MODT

  dfx deploy wallet_qa --argument '(variant { Init = 
      record {
        token_name = "'${TOKEN_NAME}'";
        token_symbol = "'${TOKEN_SYMBOL}'";
        minting_account = record { owner = principal "'${qa_minter_principal}'";};
        initial_balances = vec {
          record { record { owner = principal "'${qa_ledger_principal}'"; }; 100_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-------------------------RESERVE"}; 367_500_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-------------------------AIRDROP"}; 10_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-----------------------MARKETING"}; 50_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "------------------------ADVISORS"}; 50_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-------------------------PRESEED"}; 62_500_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "----------------------PUBLICSALE"}; 100_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "----------------------------SEED"}; 100_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "----------------------------TEAM"}; 160_000_000_000_000; };
        };
        metadata = vec {};
        transfer_fee = 10;
        archive_options = record {
          trigger_threshold = 2000;
          num_blocks_to_archive = 1000;
          controller_id = principal "'${ARCHIVE_CONTROLLER}'";
        }
  }})'

  dfx deploy wallet_dev --argument '(variant { Init = 
      record {
        token_name = "'${TOKEN_NAME}'";
        token_symbol = "'${TOKEN_SYMBOL}'";
        minting_account = record { owner = principal "'${qa_minter_principal}'";};
        initial_balances = vec {
          record { record { owner = principal "'${qa_ledger_principal}'"; }; 100_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-------------------------RESERVE"}; 367_500_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-------------------------AIRDROP"}; 10_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-----------------------MARKETING"}; 50_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "------------------------ADVISORS"}; 50_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "-------------------------PRESEED"}; 62_500_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "----------------------PUBLICSALE"}; 100_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "----------------------------SEED"}; 100_000_000_000_000; };
          record { record { owner = principal "'${qa_ledger_principal}'"; subaccount = opt blob "----------------------------TEAM"}; 160_000_000_000_000; };
        };
        metadata = vec {};
        transfer_fee = 10;
        archive_options = record {
          trigger_threshold = 2000;
          num_blocks_to_archive = 1000;
          controller_id = principal "'${ARCHIVE_CONTROLLER}'";
        }
  }})'

  

  return 0;
}

function get_local_canisters() {
  echo "record { modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; old_modclub_canister_id = principal \"bkyz2-fmaaa-aaaaa-qaaaq-cai\"; rs_canister_id = principal \"$(dfx canister id rs_qa)\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa)\"; auth_canister_id = principal \"$(dfx canister id auth_qa)\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa)\"; }"
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
  dfx deploy airdrop_qa --argument="($local_env)" &&
	deploy_wallet_canister &&
  deploy_vesting_canister &&
  dfx deploy internet_identity &&
  dfx deploy rs_qa --argument="($local_env)" &&
	dfx deploy modclub_qa --argument="($local_env)" &&
  generate_declariations "$DEV_ENV" &&
  node "$ROOT_DIR/scripts/build/gen_files_by_env.cjs" &&
  DEV_ENV=qa dfx deploy modclub_qa_assets &&
  dfx ledger fabricate-cycles --canister $(dfx canister id modclub_qa) --amount 10 &&
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

function init_qa_content() {
  log "Creating content..."
  modclub=$(get_canister_name_by_env qa "modclub")
  dfx ledger fabricate-cycles --canister $modclub
  dfx ledger fabricate-cycles --canister $modclub
  dfx ledger fabricate-cycles --canister $modclub
  dfx ledger fabricate-cycles --canister $modclub
  dfx ledger fabricate-cycles --canister $modclub
  dfx ledger fabricate-cycles --canister $modclub

  create_provider_identity $PROVIDER_IDENTITY
  setup_provider qa $PROVIDER_IDENTITY
  add_token_for_submitting_task qa $PROVIDER_IDENTITY $LEDGER_IDENTITY
  create_text_content qa $PROVIDER_IDENTITY
  create_html_content qa $PROVIDER_IDENTITY

  # Additional ACCOUNT_PAYABLE tokens are required because content creation used up tokens.
  add_token_to_ACCOUNT_PAYABLE qa $LEDGER_IDENTITY
  log "Content has been created successfully."
}

create_qa_canisters && deploy_qa_canisters && init_qa_canisters && init_qa_content
dfx identity use default # make sure to set back to default identity