#!/usr/bin/env bash
# For detailed explanation please see the GitHub Repo: https://github.com/dfinity/sns-testing/tree/main

set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

#The test canister (to be replaced with modclub canister or a specific one to be decentralized), as mentioned in README.md, keeps a greeting message along with an integer counter. It exposes public methods to get the value of the counter and a greeting text that starts with the greeting message. This suggests that GREETING is used as a part of the canister's state or output.

GREETING="${1:-Hoi}" # Greeting to be used in the proposal, if no greeting message set default is 'Hoi'.

. ./constants.sh normal

if [ -f "./sns_canister_ids.json" ]
then
    ./upgrade_dapp.sh "test" "" "(opt record {sns_governance = opt principal\"${SNS_GOVERNANCE_CANISTER_ID}\"; greeting = opt \"${GREETING}\";})"
else
    ./upgrade_dapp.sh "test" "" "(opt record {sns_governance = null; greeting = opt \"${GREETING}\";})"
fi