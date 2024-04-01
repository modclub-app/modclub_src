#!/bin/bash
set -e
current_dir="$(dirname "$0")"

mode=${1:-"upgrade"}

source "${current_dir}/../utils.sh"
source "${current_dir}/deployment_utils.sh"
network="${NETWORK:-ic}"
printf "network=%s, DEV_ENV=%s\n" "$network" "$DEV_ENV"

canister_only="${CANISTER_ONLY:-ALL}"
deploy_canisters $DEV_ENV $network $OLD_MODCLUB_INSTANCE $canister_only 2>&1 $mode | tee deploy_logs.txt

if grep -q "Do you want to proceed? yes/No" deploy_logs.txt; then
    echo "Detected the 'Do you want to proceed?' prompt in deploy_logs.txt. Failing the script."
    exit 1
elif grep -q "Error: Failed while trying to deploy canisters" deploy_logs.txt; then
    echo "Detected the 'Failed while trying to deploy canisters' error in deploy_logs.txt. Failing the script."
    exit 1
elif grep -q "Error: Failed while trying to generate type declarations" deploy_logs.txt; then
    echo "Detected the 'Error: Failed while trying to generate type declarations' error in deploy_logs.txt. Failing the script."
    exit 1
elif grep -q "Error: " deploy_logs.txt; then
    echo "Detected the 'Error: ' error in deploy_logs.txt. Failing the script."
    exit 1
else
    echo "All good."
    exit 0
fi

