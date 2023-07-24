#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}$1${NC}\n"
}

error() {
    printf "${RED}[ERROR] $1${NC}\n"
    exit 1
}

ENVIRONMENT=qa
DEPLOY_NETWORK=local

minter_principal=""
ledger_acc_principal=""

OLD_MODCLUB_INSTANCE=""

 function deploy_wallet_canister() {
  local env=$1
  local canister_env=$(get_env_canisters $env)

  # Determine the wallet canister name based on the environment
  local wallet_canister_name="wallet_${env}"
  
  if [ "$env" == "prod" ]; then
    wallet_canister_name="wallet"
  fi

  dfx deploy ${wallet_canister_name} --network=${DEPLOY_NETWORK}  --argument="(record {
    env = ${canister_env};
    ledgerInit = record {
      initial_mints = vec { 
        record { account = record { owner = principal \"$ledger_acc_principal\"; }; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"-------------------------RESERVE\"}; amount = 367_500_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"-------------------------AIRDROP\"}; amount = 10_000_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"-----------------------MARKETING\"}; amount = 50_000_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"------------------------ADVISORS\"}; amount = 50_000_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"-------------------------PRESEED\"}; amount = 62_500_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"----------------------PUBLICSALE\"}; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"----------------------------SEED\"}; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$ledger_acc_principal\"; subaccount = opt blob \"----------------------------TEAM\"}; amount = 160_000_000_000_000; };
      };
      minting_account = record { owner = principal \"$minter_principal\"; };
      ledger_account = record { owner = principal \"$ledger_acc_principal\"; };
      token_name = \"MODCLUB TEST TOKEN\";
      token_symbol = \"MODTEST\";
      decimals = 8;
      transfer_fee = 10_000;
    }}
  )"
  return 0;
}

function get_env_canisters() {
  local env=$1

  # Handle "prod" environment separately
  local modclub_canister_name="modclub_${env}"
  local rs_canister_name="rs_${env}"
  local wallet_canister_name="wallet_${env}"
  local auth_canister_name="auth_${env}"
  local vesting_canister_name="vesting_${env}"

  if [ "$env" == "prod" ]; then
    modclub_canister_name="modclub"
    rs_canister_name="rs"
    wallet_canister_name="wallet"
    auth_canister_name="auth"
    vesting_canister_name="vesting"
  fi

  echo "record { modclub_canister_id = principal \"$(dfx canister id ${modclub_canister_name} --network=${DEPLOY_NETWORK})\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id ${rs_canister_name} --network=${DEPLOY_NETWORK})\"; wallet_canister_id = principal \"$(dfx canister id ${wallet_canister_name} --network=${DEPLOY_NETWORK})\"; auth_canister_id = principal \"$(dfx canister id ${auth_canister_name} --network=${DEPLOY_NETWORK})\"; vesting_canister_id = principal \"$(dfx canister id ${vesting_canister_name} --network=${DEPLOY_NETWORK})\"; }"
}


function deploy_vesting_canister() {
  local env=$1
  local env_vars=$(get_env_canisters $env)
  
  # Handle "prod" environment separately
  local canister_name="vesting_${env}"

  if [ "$env" == "prod" ]; then
    canister_name="vesting"
  fi

  dfx deploy ${canister_name} --network=${DEPLOY_NETWORK} --argument="(record { env = $env_vars } )"
  return 0;
}

function deploy_canisters() {
  local env=$1
  export DEV_ENV=$env
  local local_env=$(get_env_canisters $env)

  # Handle "prod" environment separately
  local auth_canister_name="auth_${env}"
  local rs_canister_name="rs_${env}"
  local modclub_canister_name="modclub_${env}"
  local wallet_canister_name="wallet_${env}"
  local assets_canister_name="modclub_${env}_assets"
  local ledger_principal=""
  local minter_principal=""

  if [ "$env" == "prod" ]; then
    auth_canister_name="auth"
    rs_canister_name="rs"
    modclub_canister_name="modclub"
    wallet_canister_name="wallet"
    assets_canister_name="modclub_assets"
  fi

  if [ "$env" == "qa" ]; then
    ledger_principal=$qa_ledger_principal
    minter_principal=$qa_minter_principal
  fi

  log "Deploy ${env} Canisters..."

  dfx deploy ${auth_canister_name} --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
  deploy_wallet_canister $env -ledger_principal $ledger_principal -minter $minter_principal &&
  deploy_vesting_canister $env &&

  dfx deploy ${rs_canister_name} --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
  dfx deploy ${modclub_canister_name} --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
  init_canisters $env &&
  dfx generate ${rs_canister_name} -v &&
  dfx generate ${modclub_canister_name} -v &&
  dfx generate ${wallet_canister_name} -v &&
  DEV_ENV=$env dfx deploy ${assets_canister_name} --network=${DEPLOY_NETWORK} &&
  log "${env} Canisters DEPLOYED"
  return 0;
}

# Run init
function init_canisters() {
  local env=$1
  local canister_name="modclub_${env}"

  # Handle "prod" environment separately
  if [ "$env" == "prod" ]; then
    canister_name="modclub"
  fi

  log "Init ${env} Canisters..."
  dfx canister call ${canister_name} adminInit &&
  dfx canister call ${canister_name} configurePohForProvider "(principal \"$(dfx canister id ${canister_name})\", vec {\"challenge-user-audio\";\"challenge-user-video\"}, 365, false)" &&
  dfx canister call ${canister_name} populateChallenges
  log "${env} Canisters INITIALIZED"
  return 0;
}

usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -h, --help        Display this help message"
 echo " -e, --env         Set Environment to deploy to. Default value is qa"
 echo " -n, --network     Set Network to deploy to. Default value is <local>"
 echo " -m, --minter      Set Minter principal to deploy Ledger(Wallet canister). Default value is generated from default identity."
 echo " -l, --ledger_acc  Set LedgerAccount principal to deploy Ledger(Wallet canister). Default value is generated from default identity."
 echo " -old, --old_modclub_canister  Set Old MODCLUB canister ID. Need for Accounts import from old instance."
 echo ""
 echo "Usage Example:  $0 -e qa -n local -old v43e5-wqaaa-aaaaa-aaa2q-cai"
 echo ""
}

has_argument() {
    [[ ("$1" == *=* && -n ${1#*=}) || ( ! -z "$2" && "$2" != -*)  ]];
}

extract_argument() {
  echo "${2:-${1#*=}}"
}

check_required_opts() {
	if [[ "$minter_principal" == "" ]]; then 
		error "ERROR: minter_principal MUST be set before deploy."
	fi
	if [[ "$ledger_acc_principal" == "" ]]; then 
		error "ERROR: ledger_acc_principal MUST be set before deploy."
	fi
	if [[ "$OLD_MODCLUB_INSTANCE" == "" ]]; then 
		error "ERROR: OLD_MODCLUB_INSTANCE MUST be set before deploy."
	fi
	return 0
}

# Function to handle options and arguments
run_with_options() {
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      -e | --env*)
        if ! has_argument $@; then
          echo "Network is not specified." >&2
          usage
          exit 1
        fi

        ENVIRONMENT=$(extract_argument $@)

        shift
        ;;
      -n | --network*)
        if ! has_argument $@; then
          echo "Network is not specified." >&2
          usage
          exit 1
        fi

        DEPLOY_NETWORK=$(extract_argument $@)

        shift
        ;;
      -m | --minter*)
        if ! has_argument $@; then
          echo "Minter is not specified." >&2
          usage
          exit 1
        fi

				minter_principal=$(extract_argument $@)
        shift
        ;;
      -l | --ledger_accont*)
        if ! has_argument $@; then
          echo "Ledger_Account not specified." >&2
          usage
          exit 1
        fi

				ledger_acc_principal=$(extract_argument $@)
        shift
        ;;
      -old | --old_modclub_canister*)
        if ! has_argument $@; then
          echo "Old MODCLUB canister ID not specified." >&2
          usage
          exit 1
        fi

				OLD_MODCLUB_INSTANCE=$(extract_argument $@)
        shift
        ;;
      *)
        echo "Invalid option: $1" >&2
        usage
        exit 1
        ;;
    esac
    shift
  done

log "ENVIRONMENT - ${ENVIRONMENT}"

if [[ "$ENVIRONMENT" == *"qa"* ]]; then
    log "DEPLOY QA CANISTERS STARTED..."
    currentPrincipal=$(dfx identity whoami)
    dfx identity use default && dfx identity new qa_ledger_minter && dfx identity use qa_ledger_minter
    minter_principal=$(dfx identity get-principal)
    dfx identity use default && dfx identity new qa_ledger_identity && dfx identity use qa_ledger_identity
    ledger_acc_principal=$(dfx identity get-principal)
    dfx identity use $currentPrincipal

    check_required_opts && deploy_canisters qa $ledger_acc_principal $minter_principal
elif [[ "$ENVIRONMENT" == *"dev"* ]]; then
    log "DEPLOY DEV CANISTERS STARTED..."
    check_required_opts && deploy_canisters dev
elif [[ "$ENVIRONMENT" == *"prod"* ]]; then
    log "DEPLOY PROD CANISTERS STARTED..."
    check_required_opts && deploy_canisters prod
fi


}

run_with_options "$@"
