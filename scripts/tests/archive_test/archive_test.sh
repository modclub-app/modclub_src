#!/bin/bash
set -e

current_dir="$(dirname "$0")"
source "${current_dir}/../../backup/backup_util.sh"
source "${current_dir}/../../utils.sh"

check_contains() {
    local string="$1"
    local substring="$2"

    if echo "$string" | grep -q "$substring"; then
        return 0 # True, substring found
    else
        echo "Cannot find $substring"
        return 1 # False, substring not found
    fi
}

dfx identity use default


echo "====== Backup/Restore Start"

canister_backup_restore() {
    local data_label=$1

    # Perform the backup
    local backupId=$(backup_modclub $data_label "someTag" local qa)

    echo "  ...restore $data_label from Backup:$backupId"
    # Perform the restore
    dfx canister call modclub_qa restore "(\"$data_label\", $backupId)"
    
    
}

canister_backup_restore "stateV2"
canister_backup_restore "contentCategories"

content=$(dfx canister call  modclub_qa  toJson '("stateV2", "content")')
echo $content > test_output.txt
node scripts/tests/archive_test/test_data.cjs content


content=$(dfx canister call  modclub_qa  toJson '("stateV2", "profiles")')
echo $content > test_output.txt
node scripts/tests/archive_test/test_data.cjs profiles

echo "getBackupCanisterId()" 
dfx canister call modclub_qa getBackupCanisterId