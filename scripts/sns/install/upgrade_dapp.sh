#!/usr/bin/env bash

# This script is used to create an SNS proposal for increasing the cost of proposal rejection to 200 MOD
# This script is called by upgrade_test_canister.sh (please update the name when deploying on prod, replace test with the desired name)
# For detailed explanation please see the GitHub Repo: https://github.com/dfinity/sns-testing/tree/main


set -euo pipefail

CURRENTDIR="$(pwd)"

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

REPODIR="$(pwd)"
# below parameters passed by upgrade_test_canister.sh
export NAME="${1:-test}" # Name of the target canister or will be default to test
export WASM="${2:-}" # Path to the new WASM module for the upgrade
export ARG="${3:-()}" # Additional parameters or payload for the operation, formatted as required (often in Candid syntax)

. ./constants.sh normal

export DEVELOPER_NEURON_ID="$(dfx canister \
  --network "${NETWORK}" \
  call "${SNS_GOVERNANCE_CANISTER_ID}" \
  --candid candid/sns_governance.did \
  list_neurons "(record {of_principal = opt principal\"${DX_PRINCIPAL}\"; limit = 1})" \
    | idl2json \
    | jq -r ".neurons[0].id[0].id" \
    | python3 -c "import sys; ints=sys.stdin.readlines(); sys.stdout.write(bytearray(eval(''.join(ints))).hex())")"

cd "${CURRENTDIR}"

if [ -f "${ARG}" ]
then
  ARGFLAG="--canister-upgrade-arg-path"
else
  ARGFLAG="--canister-upgrade-arg"
fi

if [[ -z "${WASM}" ]]
then
  dfx build --network "${NETWORK}" "${NAME}"
  export WASM=".dfx/${DX_NETWORK}/canisters/${NAME}/${NAME}.wasm"
fi

export CID="$(dfx canister --network "${NETWORK}" id "${NAME}")"
quill sns  \
   --canister-ids-file "${REPODIR}/sns_canister_ids.json"  \
   --pem-file "${PEM_FILE}"  \
   make-upgrade-canister-proposal  \
   --summary "SNS Proposal for Increasing the Cost of Proposal Rejection to 200 MOD"  \
   --title "SNS Proposal for Changing Proposal Rejection Cost"  \
   --url "https://example.com/"  \
   --target-canister-id "${CID}"  \
   --wasm-path "${WASM}"  \
   "${ARGFLAG}" "${ARG}"  \
   "${DEVELOPER_NEURON_ID}" > msg.json
quill send \
  --insecure-local-dev-mode \
  --yes msg.json | grep -v "new_canister_wasm"