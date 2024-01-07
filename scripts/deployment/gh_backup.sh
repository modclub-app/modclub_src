#!/bin/bash
set -e

if [ -z "$ENVIRONMENT" ]; then
    echo "Error: ENVIRONMENT variable is not set"
    exit 1
fi
if [ -z "$DEPLOYMENT_TAG" ]; then
    echo "Error: DEPLOYMENT_TAG variable is not set"
    exit 1
fi

current_dir="$(dirname "$0")"
source "${current_dir}/../utils.sh"

modclub=$(get_canister_name_by_env $ENVIRONMENT "modclub")

backupOutput=$(dfx canister call $modclub backup "(\"stateV2\", \"${DEPLOYMENT_TAG}\")" --network=ic)
pattern='^\([0-9]+ : nat\)$'
if [[ $backupOutput =~ $pattern ]]; then
    backupId_1=$(echo $backupOutput | sed -n 's/.*(\([0-9]*\) : nat).*/\1/p')
    echo "Extracted backupId: $backupId"
else
    echo "The backupOutput does NOT match the expected pattern."
    exit 1
fi
echo "Finished backup: $backupId_1"
echo "BACKUP_ID_1=${backupId_1}" >> "$GITHUB_ENV"
echo "BACKUP_FIELDNAME_1=stateV2" >> "$GITHUB_ENV"
cat $GITHUB_ENV

echo "============="
BACKUP_CANISTER_ID=$(dfx canister call $modclub getBackupCanisterId --network=ic)
echo "Backup Canister ID: $BACKUP_CANISTER_ID"
echo "============="