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

function deploy_wallet_canister() {
  local env=""

	case $1 in
		qa) env=$(get_env_canisters qa)
		;;
		dev) env=$(get_env_canisters dev)
		;;
		prod) env=$(get_env_canisters prod)
		;;
	esac

  dfx deploy wallet_qa --network=${DEPLOY_NETWORK}  --argument="(record {
    env = $env;
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
      decimals = 6;
      transfer_fee = 10_000;
    }}
  )"
  return 0;
}

function get_env_canisters() {
  case $1 in
		qa) echo "variant { local = record { modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id rs_qa)\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa)\"; auth_canister_id = principal \"$(dfx canister id auth_qa)\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa)\"; }}"
		;;
		dev) echo "variant { local = record { modclub_canister_id = principal \"$(dfx canister id modclub_dev)\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id rs_dev)\"; wallet_canister_id = principal \"$(dfx canister id wallet_dev)\"; auth_canister_id = principal \"$(dfx canister id auth_dev)\"; vesting_canister_id = principal \"$(dfx canister id vesting_dev)\"; }}"
		;;
		prod) echo "variant { local = record { modclub_canister_id = principal \"$(dfx canister id modclub)\"; old_modclub_canister_id = principal \"${OLD_MODCLUB_INSTANCE}\"; rs_canister_id = principal \"$(dfx canister id rs)\"; wallet_canister_id = principal \"$(dfx canister id wallet)\"; auth_canister_id = principal \"$(dfx canister id auth)\"; vesting_canister_id = principal \"$(dfx canister id vesting)\"; }}"
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
	deploy_wallet_canister qa -ledger_principal $qa_ledger_principal -minter $qa_minter_principal &&
  deploy_vesting_canister qa &&

  dfx deploy rs_qa --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
	dfx deploy modclub_qa --network=${DEPLOY_NETWORK} --argument="($local_env)" &&
	dfx deploy provider_qa --network=${DEPLOY_NETWORK} &&
  dfx generate rs_qa -v &&
  dfx generate modclub_qa -v &&
  dfx generate wallet_qa -v &&
  DEV_ENV=qa dfx deploy modclub_qa_assets --network=${DEPLOY_NETWORK} &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}QA Canisters DEPLOYED${NC}\n"
	return 0;
}

function deploy_dev_canisters() {
  export DEV_ENV=dev
  local dev_env=$(get_env_canisters dev)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy DEV Canisters...${NC}\n"

	dfx deploy auth_dev --network=${DEPLOY_NETWORK} --argument="($dev_env)" &&
	deploy_wallet_canister dev -ledger_principal "" -minter "" &&
  deploy_vesting_canister dev &&

  dfx deploy rs_dev --network=${DEPLOY_NETWORK} --argument="($dev_env)" &&
	dfx deploy modclub_dev --network=${DEPLOY_NETWORK} --argument="($dev_env)" &&
	dfx deploy provider_dev --network=${DEPLOY_NETWORK} &&
  dfx generate rs_dev -v &&
  dfx generate modclub_dev -v &&
  dfx generate wallet_dev -v &&
  DEV_ENV=dev dfx deploy modclub_dev_assets --network=${DEPLOY_NETWORK} &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}DEV Canisters DEPLOYED${NC}\n"
	return 0;
}

function deploy_prod_canisters() {
  export DEV_ENV=prod
  local env=$(get_env_canisters prod)

	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}Deploy PROD Canisters...${NC}\n"

	dfx deploy auth --network=${DEPLOY_NETWORK} --argument="($env)" &&
	deploy_wallet_canister prod -ledger_principal "" -minter "" &&
  deploy_vesting_canister prod &&

  dfx deploy rs --network=${DEPLOY_NETWORK} --argument="($dev)" &&
	dfx deploy modclub --network=${DEPLOY_NETWORK} --argument="($dev)" &&
	dfx deploy provider --network=${DEPLOY_NETWORK} &&
  dfx generate rs -v &&
  dfx generate modclub -v &&
  dfx generate wallet -v &&
  DEV_ENV=prod dfx deploy modclub_assets --network=${DEPLOY_NETWORK} &&
	printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}PROD Canisters DEPLOYED${NC}\n"
	return 0;
}


usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -h, --help        Display this help message"
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
