#!/bin/bash
set -e
set -x

gzip_and_deploy() {
  local canister_name=$1
  local network=$2
  local env_vars=$3
  local mode=${4:-"upgrade"}

  echo "Creating canister ${canister_name}..."
  dfx canister create ${canister_name}

  echo "Building ${canister_name}..."
  dfx build ${canister_name}

  # Specify the output wasm file path
  local canister_output=".dfx/local/canisters/${canister_name}/${canister_name}.wasm"

  echo "Gzipping ${canister_output}..."
  gzip -f $canister_output

  # The gzipped file will have a .gz extension
  local canister_output_gzipped="${canister_output}.gz"

  # Deploy the gzipped canister
  echo "Deploying ${canister_name}..."

  echo "Env vars ${env_vars}"

  local cmd="dfx canister install --network=${network} --wasm $canister_output_gzipped --mode $mode --argument=${env_vars} $canister_name"
  
  if [[ $BYPASS_PROMPT_YES == "yes" || $BYPASS_PROMPT_YES == "Yes" || $BYPASS_PROMPT_YES == "YES" ]]; then
      cmd+=" --yes"
  fi

  eval $cmd &&
  echo "[DEPLOY] Canister ${canister_name} deployed successfully." && return 0;
  
  echo "[ERROR] Unable to deploy ${canister_name}" && exit 1
}

function deploy_canisters() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3

  local canister_only=${4:-ALL}

  export DEV_ENV=$env
  local env_vars=$(get_env_canisters_vars $env $network $old_modclub_inst)

  # hardcode the ledger identities for now.
  local ledger_minter_identity=qa_ledger_minter
  local ledger_account_identity=qa_ledger_identity

  local modclub_canister_name=$(get_canister_name_by_env $env "modclub")
  local rs_canister_name=$(get_canister_name_by_env $env "rs")
  local wallet_canister_name=$(get_canister_name_by_env $env "wallet")
  local auth_canister_name=$(get_canister_name_by_env $env "auth")
  local assets_canister_name="$(get_canister_name_by_env $env "modclub")_assets"
  local airdrop_canister_name=$(get_canister_name_by_env $env "airdrop")

  local decideid_assets_canister_name="$(get_canister_name_by_env $env "desideid")_assets"

  if [ "$canister_only" != "ALL" ]; then
    log "[${env}] Only deploy $canister_only"
  fi

  if [ "$canister_only" = "modclub_assets" ]; then
    generate_declarations $env $network &&
    node "$current_dir/../build/gen_files_by_env.cjs" &&
    DEV_ENV=$env dfx deploy ${assets_canister_name} --network=${network} &&
    log "${env} Canisters DEPLOYED"
  elif [ "$canister_only" = "modclub" ]; then
    gzip_and_deploy $modclub_canister_name $network "'(${env_vars})'"
  elif [ "$canister_only" = "auth" ]; then
    gzip_and_deploy $auth_canister_name $network "'(${env_vars})'"
  elif [ "$canister_only" = "wallet" ]; then
    deploy_wallet_canister $env $network $ledger_minter_identity $ledger_account_identity
  elif [ "$canister_only" = "vesting" ]; then
    deploy_vesting_canister $env $network $old_modclub_inst
  elif [ "$canister_only" = "airdrop" ]; then
    gzip_and_deploy $airdrop_canister_name $network "'(${env_vars})'"
  elif [ "$canister_only" = "rs" ]; then
    gzip_and_deploy $rs_canister_name $network "'(${env_vars})'"
  elif [ "$canister_only" = "ALL" ]; then
    set -x
    set -e
    log "Deploy ${env} Canisters..."
    gzip_and_deploy $auth_canister_name $network "'(${env_vars})'" &&
    deploy_wallet_canister $env $network $ledger_minter_identity $ledger_account_identity &&
    deploy_vesting_canister $env $network $old_modclub_inst &&
    gzip_and_deploy $airdrop_canister_name $network "'(${env_vars})'" &&  

    gzip_and_deploy $rs_canister_name $network "'(${env_vars})'" &&
    gzip_and_deploy $modclub_canister_name $network "'(${env_vars})'" &&
    init_canisters $env $network &&
    generate_declarations $env $network &&
    node "$current_dir/../build/gen_files_by_env.cjs" &&
    DEV_ENV=$env dfx deploy ${assets_canister_name} --network=${network} &&
    log "${env} Canisters DEPLOYED"
  fi

  
  return 0;
}

# Run init
function init_canisters() {
  local env=$1
  local network=${2:-local}
  local modclub_canister_name=$(get_canister_name_by_env $env "modclub")

  log "Init ${env} Canisters..."
  dfx canister call ${modclub_canister_name} adminInit --network=$network
  dfx canister call ${modclub_canister_name} configurePohForProvider "(principal \"$(dfx canister id ${modclub_canister_name} --network=$network)\", vec {\"challenge-user-audio\";\"challenge-user-video\"}, 365:nat, false)" --network=$network
  dfx canister call ${modclub_canister_name} populateChallenges --network=$network
  log "${env} Canisters INITIALIZED"
  return 0;
}

function deploy_wallet_canister() {
  local env=$1
  local network=$2

  local ledger_minter_identity=$3
  local ledger_account_identity=$4


  if ! dfx identity use $ledger_minter_identity >/dev/null 2>&1; then
		dfx identity new $ledger_minter_identity --disable-encryption
	fi
  dfx identity use $ledger_minter_identity
  local minter_principal=$(dfx identity get-principal)

	if ! dfx identity use $ledger_account_identity >/dev/null 2>&1; then
		dfx identity new $ledger_account_identity --disable-encryption
	fi
  dfx identity use $ledger_account_identity
  local ledger_acc_principal=$(dfx identity get-principal)

  dfx identity use default 

  local ARCHIVE_CONTROLLER=$(dfx identity get-principal)
  local airdrop_canister_name=$(get_canister_name_by_env $env "airdrop")
  local airdrop_canister_id=$(dfx canister id ${airdrop_canister_name} --network=${network})
  
  local TOKEN_NAME="Modclub_Token"
  local TOKEN_SYMBOL=MODT

  local wallet_canister_name=$(get_canister_name_by_env $env "wallet")

  local wallet_arg='(variant { Init = 
      record {
        token_name = "'${TOKEN_NAME}'";
        token_symbol = "'${TOKEN_SYMBOL}'";
        minting_account = record { owner = principal "'${minter_principal}'";};
        initial_balances = vec {
          record { record { owner = principal "'${ledger_acc_principal}'"; }; 100_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "-------------------------RESERVE"}; 367_500_000_000_000; };
          record { record { owner = principal "'${airdrop_canister_id}'"; subaccount = null}; 10_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "-----------------------MARKETING"}; 50_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "------------------------ADVISORS"}; 50_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "-------------------------PRESEED"}; 62_500_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "----------------------PUBLICSALE"}; 100_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "----------------------------SEED"}; 100_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "----------------------------TEAM"}; 160_000_000_000_000; };
        };
        metadata = vec {};
        transfer_fee = 10;
        archive_options = record {
          trigger_threshold = 2000;
          num_blocks_to_archive = 1000;
          controller_id = principal "'${ARCHIVE_CONTROLLER}'";
        }
  }})'

  echo $wallet_arg

  local cmd="dfx deploy ${wallet_canister_name} --network=${network}  --argument='${wallet_arg}'"

  eval $cmd &&
  return 0;
}

function get_env_canisters_vars() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3

  local decideid_assets_canister_name="$(get_canister_name_by_env $env "decideid")_assets"

  local modclub_canister_name=$(get_canister_name_by_env $env "modclub")
  local rs_canister_name=$(get_canister_name_by_env $env "rs")
  local wallet_canister_name=$(get_canister_name_by_env $env "wallet")
  local auth_canister_name=$(get_canister_name_by_env $env "auth")
  local vesting_canister_name=$(get_canister_name_by_env $env "vesting")

  local wallet_canister_id=$(dfx canister id ${wallet_canister_name} --network=${network})

  if [ "$wallet_canister" != "" ]; then
    wallet_canister_id=$wallet_canister
  fi

  echo "record { modclub_canister_id = principal \"$(dfx canister id ${modclub_canister_name} --network=${network})\"; decideid_assets_canister_id = principal \"$(dfx canister id ${modclub_assets_canister_name} --network=${network})\"; old_modclub_canister_id = principal \"${old_modclub_inst}\"; rs_canister_id = principal \"$(dfx canister id ${rs_canister_name} --network=${network})\"; wallet_canister_id = principal \"${wallet_canister_id}\"; auth_canister_id = principal \"$(dfx canister id ${auth_canister_name} --network=${network})\"; vesting_canister_id = principal \"$(dfx canister id ${vesting_canister_name} --network=${network})\"; }"
}


function deploy_vesting_canister() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3

  local env_vars=$(get_env_canisters_vars $env $network $old_modclub_inst)
  
  # Handle "prod" environment separately
  local canister_name=$(get_canister_name_by_env $env "vesting")

  local cmd="dfx deploy ${canister_name} --network=${network} --argument='(${env_vars})'"

  eval $cmd &&
  dfx generate ${canister_name} -v &&
  return 0;
}

# Function for quick building and deploying a specific canister
function quick_build_and_deploy_canister() {
    local canister_name=$1
    local env=$2
    local network=$3
    local env_vars=$4
    local mode=${5:-"upgrade"}

    local canister_source

    # Adjust the source path based on the canister name
    if [ "$canister_name" == "auth" ]; then
        canister_source="./src/authentication/main.mo"
    else
        canister_source="./src/${canister_name}/main.mo"
    fi

    local canister_output
    local canister_name_with_env=canister_name

    ls -la "./.dfx/local/canisters" ||
    mkdir "./.dfx/local/canisters" 
    if [ "$env" == "prod" ]; then
      mkdir "./.dfx/${network}/canisters/${canister_name}/" ||
      log "Canister ${canister_name} directory already exists."
      canister_output="./.dfx/${network}/canisters/${canister_name}/${canister_name}.wasm"
    else
      canister_name_with_env="${canister_name}_${env}"
      mkdir "./.dfx/${network}/canisters/${canister_name_with_env}/" ||
      log "Canister ${canister_name_with_env} directory already exists."
      canister_output="./.dfx/${network}/canisters/${canister_name_with_env}/${canister_name_with_env}.wasm"
    fi

    quick_build ${canister_name} ${env} ${network} &&
    quick_deploy "${canister_name_with_env}" "${network}" "${env_vars}" "${canister_output}" "${mode}" || exit 1;

    return 0;
}

# Function for quick build for specific canister
function quick_build() {
    local canister_name=$1
    local env=$2
    local network=$3

    local canister_source

    # No quick build for Wallet canister
    if [ "$canister_name" == "wallet" ]; then
        return 0;
    fi

    # Adjust the source path based on the canister name
    if [ "$canister_name" == "auth" ]; then
        canister_source="src/authentication/main.mo"
    else
        canister_source="src/${canister_name}/main.mo"
    fi

    local canister_output
    local canister_name_with_env=canister_name
    # Adjust the wasm folder based on the canister name and env

    ls -la "./.dfx/local/canisters" ||
    mkdir "./.dfx/local/canisters" 
    if [ "$env" == "prod" ]; then
      mkdir "./.dfx/${network}/canisters/${canister_name}/" ||
      log "Canister ${canister_name} directory already exists."
      canister_output="./.dfx/${network}/canisters/${canister_name}/${canister_name}.wasm"
    else
      canister_name_with_env="${canister_name}_${env}"
      mkdir "./.dfx/${network}/canisters/${canister_name_with_env}/" ||
      log "Canister ${canister_name_with_env} directory already exists."
      canister_output="./.dfx/${network}/canisters/${canister_name_with_env}/${canister_name_with_env}.wasm"
    fi

    # Building the canister using the moc command
    # TODO: Create a Mops parser and use that to generate the moc command
    ~/.cache/dfinity/versions/0.14.3/moc $canister_source -o $canister_output -c --debug --idl --stable-types \
    --public-metadata candid:service --public-metadata candid:args --actor-idl ./.dfx/local/canisters/idl/ \
    --actor-alias $canister_name_with_env $(dfx canister id $canister_name_with_env) \
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
        echo "Build failed for canister $canister_name_with_env"
        exit 1
    fi

    return 0;
}

# Function for quick deploying a specific canister
function quick_deploy() {
    local canister_name_with_env=$1
    local network=$2
    local env_vars=$3
    local canister_output=$4
    local mode=${5:-"upgrade"}

    # Gzip the WASM file
    gzip -f $canister_output

    # The gzipped file will have a .gz extension
    local canister_output_gzipped="${canister_output}.gz"

    # Deploy the gzipped canister
    dfx canister install --network=${network} --wasm $canister_output_gzipped --mode $mode --argument="($env_vars)" $canister_name_with_env &&
    log "[QUICK_DEPLOY] Canister ${canister_name_with_env} deployed successfully." &&
    return 0 ||
    error "[FATAL_ERROR] Enable to deploy ${canister_name_with_env}" && exit 1;
}

function deploy_canisters_quick() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3
  local installation_mode=${4:-"upgrade"}
  local assets_canister_name="$(get_canister_name_by_env $env "modclub")_assets"
  local env_vars=$(get_env_canisters_vars $env $network $old_modclub_inst)
  local ledger_minter_identity=qa_ledger_minter
  local ledger_account_identity=qa_ledger_identity

  log "[DEBUG] ${env_vars}"
  log "[DEBUG] ${assets_canister_name}"
  # List all your canisters here and call quick_build_and_deploy_canister for each
  quick_build_and_deploy_canister "modclub" ${env} ${network} "${env_vars}" "${installation_mode}" &&
  quick_build_and_deploy_canister "rs" ${env} ${network} "${env_vars}" "${installation_mode}" &&
  quick_build_and_deploy_canister "auth" ${env} ${network} "${env_vars}" "${installation_mode}" &&
  quick_build_and_deploy_canister "vesting" ${env} ${network} "${env_vars}" "${installation_mode}" &&
  deploy_wallet_canister $env $network $ledger_minter_identity $ledger_account_identity "${installation_mode}" &&
  generate_declarations $env $network &&
  DEV_ENV=$env node "$current_dir/../build/gen_files_by_env.cjs" &&
  DEV_ENV=$env dfx deploy ${assets_canister_name} --network=${network} --argument="'(${env_vars})'" && return 0 ||
  error "[CRASH] ${env} ${network} ${env_vars}" && exit 1;
}
