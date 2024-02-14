#!/bin/bash
set -e

current_dir="$(dirname "$0")"
source "${current_dir}/../../utils.sh"

dfx identity use default
dfx canister call decideid_qa hello

output=$(dfx canister call decideid_qa registerAccount '("John", "Doe", "john.doe@example.com")')
echo "$output"
id=$(echo "$output" | awk -F'"' '/ok =/{print $(NF-1)}')
echo "Created decide id: $id"
dfx canister call decideid_qa getAccount "(\"$id\")"

