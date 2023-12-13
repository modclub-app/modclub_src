#!/bin/bash
set -e

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
backupOutput=$(dfx canister call modclub_qa backup '("stateV2", "someTag")')
backupId=$(echo $backupOutput | sed -n 's/.*(\([0-9]*\) : nat).*/\1/p')
echo "Finished backup: $backupId"
dfx canister call modclub_qa restore "(\"stateV2\", $backupId)"
echo "Finished restore: $backupId"

echo "====== Backup/Restore Done"

content=$(dfx canister call  modclub_qa  toJson '("stateV2", "content")')
echo $content > test_output.txt
node scripts/tests/archive_test/test_data.cjs content


content=$(dfx canister call  modclub_qa  toJson '("stateV2", "profiles")')
echo $content > test_output.txt
node scripts/tests/archive_test/test_data.cjs profiles