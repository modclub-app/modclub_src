#!/bin/bash

# This script is to help deploy decideid caniter locally


current_dir="$(dirname "$0")"
ROOT_DIR="$current_dir/../../"
source "${ROOT_DIR}/scripts/utils.sh"
source "${ROOT_DIR}/scripts/deployment/deployment_utils.sh"

ENV=qa
NETWORK=local
OLD_MODCLUB_CANISTER_ID="la3yy-gaaaa-aaaah-qaiuq-cai"

function deploy_decideid() {
  export DEV_ENV=qa
  local local_env=$(get_env_canisters_vars $ENV $NETWORK $OLD_MODCLUB_CANISTER_ID)

  dfx deploy decideid_qa --argument="($local_env)"
}

deploy_decideid