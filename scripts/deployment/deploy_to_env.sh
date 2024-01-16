#!/bin/bash

current_dir="$(dirname "$0")"

source "${current_dir}/../utils.sh"
source "${current_dir}/deployment_utils.sh"


ENVIRONMENT=qa
DEPLOY_NETWORK=local

minter_principal=""
ledger_acc_principal=""

wallet_canister=""

OLD_MODCLUB_INSTANCE=""

usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -h, --help        Display this help message"
 echo " -e, --env         Set Environment to deploy to. Default value is qa"
 echo " -n, --network     Set Network to deploy to. Default value is <local>"
 echo " -m, --minter      Set Minter principal to deploy Ledger(Wallet canister). Default value is generated from default identity."
 echo " -l, --ledger_acc  Set LedgerAccount principal to deploy Ledger(Wallet canister). Default value is generated from default identity."
 echo " -old, --old_modclub_canister  Set Old MODCLUB canister ID. Need for Accounts import from old instance."
 echo " -w, --wallet_canister         Set Wallet(TokenLedger) canister ID."
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
	# if [[ "$minter_principal" == "" ]]; then 
	# 	error "ERROR: minter_principal MUST be set before deploy."
	# fi
	# if [[ "$ledger_acc_principal" == "" ]]; then 
	# 	error "ERROR: ledger_acc_principal MUST be set before deploy."
	# fi
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
      -w | --wallet_canister*)
        if ! has_argument $@; then
          echo "Wallet canister ID not specified." >&2
          usage
          exit 1
        fi

				wallet_canister=$(extract_argument $@)
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

    check_required_opts && deploy_canisters_quick qa $DEPLOY_NETWORK $OLD_MODCLUB_INSTANCE # $ledger_acc_principal $minter_principal
elif [[ "$ENVIRONMENT" == *"dev"* ]]; then
    log "DEPLOY DEV CANISTERS STARTED..."
    check_required_opts && deploy_canisters_quick dev $DEPLOY_NETWORK $OLD_MODCLUB_INSTANCE
elif [[ "$ENVIRONMENT" == *"prod"* ]]; then
    log "DEPLOY PROD CANISTERS STARTED..."
    check_required_opts && deploy_canisters prod $DEPLOY_NETWORK $OLD_MODCLUB_INSTANCE
fi

}

run_with_options "$@"
