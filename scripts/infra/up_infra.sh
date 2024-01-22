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
LEDGER_MINTER_IDENTITY="qa_ledger_minter"
PROVIDER_IDENTITY="qa_test_provider"

read -p "Press any key to continue..."


printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Modclub test infra START ...${NC}\n"

# Prepare test infra
function create_qa_canisters() {
  printf  "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Creating QA Canisters...${NC}\n"
	dfx identity use default
  dfx canister create crypto_api_local &&
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
  echo "record { crypto_api_canister_id = principal \"$(dfx canister id crypto_api_local)\"; modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; old_modclub_canister_id = principal \"bkyz2-fmaaa-aaaaa-qaaaq-cai\"; rs_canister_id = principal \"$(dfx canister id rs_qa)\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa)\"; auth_canister_id = principal \"$(dfx canister id auth_qa)\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa)\"; }"
}

function deploy_vesting_canister() {
	dfx identity use default
  local env=$(get_local_canisters)
  dfx deploy vesting_qa  --argument="($env)"
  return 0;
}


# Deploy AuthCanister
function deploy_qa_canisters() {
  export DEV_ENV=qa
  local local_env=$(get_local_canisters)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy QA Canisters...${NC}\n"

	dfx deploy crypto_api_local && #--argument="(record { master_sk_hex = $MK_HASH })" &&

	dfx deploy auth_qa --argument="($local_env)" &&
  dfx deploy airdrop_qa --argument="($local_env)" &&
	deploy_wallet_canister &&
  deploy_vesting_canister &&
  dfx deploy internet_identity &&
  dfx deploy rs_qa --argument="($local_env)" &&
	dfx deploy modclub_qa --argument="($local_env)" &&
  generate_declarations "$DEV_ENV" &&
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
  dfx canister call modclub_qa populateChallenges &&
	dfx canister call modclub_qa shuffleContent &&
	dfx canister call modclub_qa shufflePohContent &&
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
   #Setup vote complexity
  dfx identity use default

  create_provider_identity $PROVIDER_IDENTITY
  setup_provider qa $PROVIDER_IDENTITY
  add_token_for_submitting_task qa $PROVIDER_IDENTITY $LEDGER_IDENTITY
  create_text_content qa $PROVIDER_IDENTITY
  create_html_content qa $PROVIDER_IDENTITY

  # Additional ACCOUNT_PAYABLE tokens are required because content creation used up tokens.
  add_token_to_ACCOUNT_PAYABLE qa $LEDGER_MINTER_IDENTITY
  log "Content has been created successfully."
}

# Function for quick building and deploying a specific canister
function quick_build_and_deploy_canister() {
    local canister_name=$1
    local canister_source

    # Adjust the source path based on the canister name
    if [ "$canister_name" == "auth_qa" ]; then
        canister_source="./src/authentication/main.mo"
    else
        local modified_canister_name=${canister_name%_qa}
        canister_source="./src/${modified_canister_name}/main.mo"
    fi

    local canister_output="./.dfx/local/canisters/${canister_name}/${canister_name}.wasm" # Adjust this path as needed

    # Prepare local environment variables for deployment
    local local_env=$(get_local_canisters)

    # Building the canister using the moc command
    # TODO: Create a Mops parser and use that to generate the moc command
    ~/.cache/dfinity/versions/0.15.2/moc $canister_source -o $canister_output -c --debug --idl --stable-types \
    --public-metadata candid:service --public-metadata candid:args --actor-idl ./.dfx/local/canisters/idl/ \
    --actor-alias $canister_name $(dfx canister id $canister_name) \
    --package base .mops/base@0.9.7/src \
    --package uuid .mops/_github/uuid#v0.2.0/src \
    --package encoding .mops/_github/encoding#v0.3.1/src \
    --package array .mops/_github/array#v0.1.1/src \
    --package io .mops/_github/io#v0.3.1/src \
    --package crypto .mops/_github/crypto#v0.2.0/src \
    --package rand .mops/_github/rand#v0.2.2/src \
    --package json .mops/_github/json#v0.2.0/src \
    --package parser-combinators .mops/_github/parser-combinators#v0.1.1/src \
    --package serde .mops/serde@2.0.4/src \
    --package itertools .mops/itertools@0.1.2/src \
    --package candid .mops/candid@1.0.2/src \
    --package xtended-numbers .mops/xtended-numbers@0.2.1/src \
    --package map .mops/map@8.1.0/src \
    --package motoko-sequence .mops/_github/motoko-sequence#master@366c4191d856ed4842267f5ab89d7222ed2d71d0/src \
    --package motoko-matchers .mops/_github/motoko-matchers#master@3dac8a071b69e4e651b25a7d9683fe831eb7cffd/src \
    --package backup .mops/backup@1.1.1/src \
    --package linked-list .mops/linked-list@0.1.0/src \
    --package http-types .mops/http-types@1.0.0/src \
    --package motoko-datetime .mops/_github/motoko-datetime#v0.1.1/src \
    -v --max-stable-pages 786432 -no-check-ir

    # Check if build was successful
    if [ $? -ne 0 ]; then
        echo "Build failed for canister $canister_name"
        exit 1
    fi

    # Gzip the WASM file
    gzip -f $canister_output

    # The gzipped file will have a .gz extension
    local canister_output_gzipped="${canister_output}.gz"

    # Deploy the gzipped canister
    dfx canister install --wasm $canister_output_gzipped --mode upgrade $canister_name --argument="($local_env)"
}

# Function to quick build and deploy all QA canisters
function deploy_quick_qa_canisters() {
    # List all your canisters here and call quick_build_and_deploy_canister for each
    quick_build_and_deploy_canister "modclub_qa"
    quick_build_and_deploy_canister "rs_qa"
    quick_build_and_deploy_canister "auth_qa"
    quick_build_and_deploy_canister "vesting_qa"

    # Add similar lines for other canisters
    deploy_wallet_canister
}

# Function to deploy a specific canister
function deploy_specific_canister() {
  case $1 in
    "internet_identity")
      dfx deploy internet_identity ;;
    "auth_qa")
      local local_env=$(get_local_canisters)
      dfx deploy auth_qa --argument="($local_env)" ;;
    "wallet_qa")
      deploy_wallet_canister ;;
    "wallet_dev")
      deploy_wallet_canister ;;
    "rs_qa")
      local local_env=$(get_local_canisters)
      dfx deploy rs_qa --argument="($local_env)" ;;
    "modclub_qa")
      local local_env=$(get_local_canisters)
      dfx deploy modclub_qa --argument="($local_env)" ;;
    "vesting_qa")
      deploy_vesting_canister ;;
    "modclub_qa_assets")
      DEV_ENV=qa dfx deploy modclub_qa_assets ;;
    "airdrop_qa")
      local local_env=$(get_local_canisters)
      dfx deploy airdrop_qa --argument="($local_env)" ;;
    "archive_qa")
      local local_env=$(get_local_canisters)
      dfx deploy archive_qa --argument="($local_env)" ;;
    *)
      echo "Unknown canister: $1"
      exit 1 ;;
  esac
}

# Function to check if the canister build directories exist
function check_canister_directories() {
    local canisters=("modclub_qa" "rs_qa" "vesting_qa" "auth_qa") # Add all your canister names here

    for canister in "${canisters[@]}"; do
        if [ ! -d "./.dfx/local/canisters/${canister}" ]; then
            echo "Directory for canister ${canister} not found. Please run a regular up_infra first."
            return 1
        fi
    done

    return 0
}

# Main execution
if [ "$#" -eq 1 ]; then
    if [ "$1" == "--quick" ]; then
        echo "Checking canister directories for quick build..."
        if check_canister_directories; then
            echo "Quick building and deploying all canisters..."
            create_qa_canisters
            deploy_quick_qa_canisters
        else
            exit 1
        fi
    else
        CANISTER_NAME=$1
        echo "Deploying specific canister: $CANISTER_NAME"
        create_qa_canisters
        deploy_specific_canister $CANISTER_NAME
    fi
elif [ "$#" -eq 2 ] && [ "$2" == "--quick" ]; then
    CANISTER_NAME=$1
    echo "Quick building and deploying canister: $CANISTER_NAME"
    create_qa_canisters
    quick_build_and_deploy_canister $CANISTER_NAME
else
    echo "Deploying all canisters using standard process"
    create_qa_canisters && deploy_qa_canisters && init_qa_canisters && init_qa_content
fi

dfx identity use default # make sure to set back to default identity