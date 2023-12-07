#!/bin/bash

current_dir="$(dirname "$0")"
source "${current_dir}/deployment_utils.sh"
source "${current_dir}/../utils.sh"

ENV=$1
NETWORK=$2
OLD_MODCLUB_CANISTER_ID="la3yy-gaaaa-aaaah-qaiuq-cai"

get_env_canisters_vars $ENV $NETWORK $OLD_MODCLUB_CANISTER_ID || exit 1
