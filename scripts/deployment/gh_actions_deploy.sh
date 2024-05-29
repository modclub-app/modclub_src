#!/bin/bash
set -e
current_dir="$(dirname "$0")"

mode=${1:-"upgrade"}

source "${current_dir}/../utils.sh"
source "${current_dir}/deployment_utils.sh"
network="${NETWORK:-ic}"
printf "network=%s, DEV_ENV=%s\n" "$network" "$DEV_ENV"

canister_only="${CANISTER_ONLY:-ALL}"
dfx canister uninstall-code --network ic --all