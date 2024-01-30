#!/usr/bin/env bash
# For detailed explanation please see the GitHub Repo: https://github.com/dfinity/sns-testing/tree/main

set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

. ./constants.sh normal

if [ -f "./sns_canister_ids.json" ]
then
    ./upgrade_dapp.sh
else
    ./upgrade_dapp.sh
fi