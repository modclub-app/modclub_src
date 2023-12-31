#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Modclub DEPLOY START ...${NC}\n"

ENVIRONMENT=qa
DEPLOY_NETWORK=local

minter_principal=""
ledger_acc_principal=""

OLD_MODCLUB_INSTANCE=""

function get_env_canisters() {
  case $1 in
		qa) echo "record { modclub_canister_id = principal \"$(dfx canister id modclub_qa --network=${DEPLOY_NETWORK})\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id rs_qa --network=${DEPLOY_NETWORK})\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa --network=${DEPLOY_NETWORK})\"; auth_canister_id = principal \"$(dfx canister id auth_qa --network=${DEPLOY_NETWORK})\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa --network=${DEPLOY_NETWORK})\"; }"
		;;
		dev) echo "record { modclub_canister_id = principal \"$(dfx canister id modclub_dev --network=${DEPLOY_NETWORK})\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id rs_dev --network=${DEPLOY_NETWORK})\"; wallet_canister_id = principal \"$(dfx canister id wallet_dev --network=${DEPLOY_NETWORK})\"; auth_canister_id = principal \"$(dfx canister id auth_dev --network=${DEPLOY_NETWORK})\"; vesting_canister_id = principal \"$(dfx canister id vesting_dev --network=${DEPLOY_NETWORK})\"; }"
		;;
		prod) echo "record { modclub_canister_id = principal \"$(dfx canister id modclub --network=${DEPLOY_NETWORK})\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id rs --network=${DEPLOY_NETWORK})\"; wallet_canister_id = principal \"$(dfx canister id wallet --network=${DEPLOY_NETWORK})\"; auth_canister_id = principal \"$(dfx canister id auth --network=${DEPLOY_NETWORK})\"; vesting_canister_id = principal \"$(dfx canister id vesting --network=${DEPLOY_NETWORK})\"; }"
		;;
	esac
}

function deploy_vesting_canister() {
	local env=""
	case $1 in
		qa) env=$(get_env_canisters qa)
		;;
		dev) env=$(get_env_canisters dev)
		;;
		prod) env=$(get_env_canisters prod)
		;;
	esac
  dfx deploy vesting_qa --network=${DEPLOY_NETWORK} --argument="(record { env = $env } )"
  return 0;
}

# Deploy AuthCanister
function deploy_qa_canisters() {
  export DEV_ENV=qa
  local local_env=$(get_env_canisters qa)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy QA Canisters...${NC}\n"

	dfx deploy auth_qa --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
  deploy_vesting_canister qa &&

  dfx deploy rs_qa --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
	dfx deploy modclub_qa --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
  dfx generate rs_qa -v &&
  dfx generate modclub_qa -v &&
  DEV_ENV=qa dfx deploy modclub_qa_assets --network=${DEPLOY_NETWORK} &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters DEPLOYED${NC}\n"
	return 0;
}

function deploy_dev_canisters() {
  export DEV_ENV=dev
  local dev_env=$(get_env_canisters dev)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy DEV Canisters...${NC}\n"

	dfx deploy auth_dev --network=${DEPLOY_NETWORK} --argument="($dev_env)" &&
  deploy_vesting_canister dev &&

  dfx deploy rs_dev --network=${DEPLOY_NETWORK} --argument="($dev_env)" &&
	dfx deploy modclub_dev --network=${DEPLOY_NETWORK} --argument="($dev_env)" &&
  dfx generate rs_dev -v &&
  dfx generate modclub_dev -v &&
  DEV_ENV=dev dfx deploy modclub_dev_assets --network=${DEPLOY_NETWORK} &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}DEV Canisters DEPLOYED${NC}\n"
	return 0;
}

function deploy_prod_canisters() {
  export DEV_ENV=prod
  local env=$(get_env_canisters prod)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy PROD Canisters...${NC}\n"

	dfx deploy auth --network=${DEPLOY_NETWORK} --argument="($env)" &&
  deploy_vesting_canister prod &&

  dfx deploy rs --network=${DEPLOY_NETWORK} --argument="($dev)" &&
	dfx deploy modclub --network=${DEPLOY_NETWORK} --argument="($dev)" &&
  dfx generate rs -v &&
  dfx generate modclub -v &&
  DEV_ENV=prod dfx deploy modclub_assets --network=${DEPLOY_NETWORK} &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}PROD Canisters DEPLOYED${NC}\n"
	return 0;
}


usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -h, --help        Display this help message"
 echo " -e, --env         Set Environment to deploy to. Default value is qa"
 echo " -n, --network     Set Network to deploy to. Default value is <local>"
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
		echo "ERROR: minter_principal MUST be set before deploy."
		exit 1;
	fi
	if [[ "$ledger_acc_principal" == "" ]]; then 
		echo "ERROR: ledger_acc_principal MUST be set before deploy."
		exit 1;
	fi
	if [[ "$OLD_MODCLUB_INSTANCE" == "" ]]; then 
		echo "ERROR: OLD_MODCLUB_INSTANCE MUST be set before deploy."
		exit 1;
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

	echo "ENVIRONMENT - ${ENVIRONMENT}"

	if [[ "$ENVIRONMENT" == *"qa"* ]]; then
		echo "DEPLOY QA CANISTERS STARTED..."
		currentPrincipal=$(dfx identity whoami)
		dfx identity use default && dfx identity new qa_ledger_minter && dfx identity use qa_ledger_minter
		minter_principal=$(dfx identity get-principal)
		dfx identity use default && dfx identity new qa_ledger_identity && dfx identity use qa_ledger_identity
		ledger_acc_principal=$(dfx identity get-principal)
		dfx identity use $currentPrincipal

		check_required_opts && deploy_qa_canisters
		else if [[ "$ENVIRONMENT" == *"dev"* ]]; then
			echo "DEPLOY DEV CANISTERS STARTED..."
			check_required_opts && deploy_dev_canisters

			else if [[ "$ENVIRONMENT" == *"prod"* ]]; then
				echo "DEPLOY PROD CANISTERS STARTED..."
				check_required_opts && deploy_prod_canisters
			fi
		fi
	fi


}

run_with_options "$@"
