#!/bin/bash
set -e

current_dir="$(dirname "$0")"
source "${current_dir}/../../utils.sh"

dfx identity use default
dfx canister call decideid_qa hello