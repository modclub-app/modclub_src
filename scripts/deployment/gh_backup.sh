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
source "${current_dir}/../backup/backup_util.sh"

modclub=$(get_canister_name_by_env $ENVIRONMENT "modclub")

backupId_1=$(backup_modclub "stateV2" $DEPLOYMENT_TAG "ic" $ENVIRONMENT)
echo "Finished backup: $backupId_1"
echo "BACKUP_ID_1=${backupId_1}" >> "$GITHUB_ENV"
echo "BACKUP_FIELDNAME_1=stateV2" >> "$GITHUB_ENV"

# TODO: After successfully deploying PR #569, please retrieve the codes below.
# backupId_2=$(backup_modclub "contentCategories" $DEPLOYMENT_TAG "ic")
# echo "Finished backup: $backupId_2"
# echo "BACKUP_ID_2=${backupId_2}" >> "$GITHUB_ENV"
# echo "BACKUP_FIELDNAME_2=contentCategories" >> "$GITHUB_ENV"


cat $GITHUB_ENV
echo "============="
BACKUP_CANISTER_ID=$(dfx canister call $modclub getBackupCanisterId --network=ic)
echo "Backup Canister ID: $BACKUP_CANISTER_ID"
echo "============="