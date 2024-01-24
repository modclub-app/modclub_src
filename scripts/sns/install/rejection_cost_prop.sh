#!/usr/bin/env bash

set -euo pipefail

CURRENTDIR="$(pwd)"

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

REPODIR="$(pwd)"

export NAME="${1:-test}"
#export WASM="${2:-}" commented because script is just for submitting governance proposals and does not involve handling WASM files
#export ARG="${3:-()}" for simplicity commented until we need an argument to pass

. ./constants.sh normal
# export DX_PRINCIPAL="$(dfx identity get-principal)" from constants.sh
export DEVELOPER_NEURON_ID="$(dfx canister \
  --network "${NETWORK}" \
  call "${SNS_GOVERNANCE_CANISTER_ID}" \
  --candid candid/sns_governance.did \
  list_neurons "(record {of_principal = opt principal\"${DX_PRINCIPAL}\"; limit = 1})" \
    | idl2json \
    | jq -r ".neurons[0].id[0].id" \
    | python3 -c "import sys; ints=sys.stdin.readlines(); sys.stdout.write(bytearray(eval(''.join(ints))).hex())")"

cd "${CURRENTDIR}"

# DX_NETWORK from constants.sh to check if the network is local
#tasks like submitting governance proposal doesnt require wasm file so below commented
#if [[ -z "${WASM}" ]]
#then
  #dfx build --network "${NETWORK}" "${NAME}"
  #export WASM=".dfx/${DX_NETWORK}/canisters/${NAME}/${NAME}.wasm"
#fi

export CID="$(dfx canister --network "${NETWORK}" id "${NAME}")"
quill sns  \
   --canister-ids-file "${REPODIR}/sns_canister_ids.json"  \
   --pem-file "${PEM_FILE}"  \
   make-rejection-cost-proposal  \
   --summary "Increase rejection cost for proposals"  \
   --title "Proposal to Increase Rejection Cost"  \
   --url "https://example.com/"  \
   #--target-canister-id "${CID}"  \ commented because the aim is changing the governance system's parameters, not upgrading a canister.
   #--wasm-path "${WASM}"  \ no need since there is no upgrade to canister
   #"${ARGFLAG}" "${ARG}"  \ no need to change canister parameters
   "${DEVELOPER_NEURON_ID}" > msg.json
quill send \
  --insecure-local-dev-mode \  # remove this flag if you are not using local dev mode
  --yes msg.json | grep -v "new_canister_wasm"  # remove --yes if you want to confirm the submission manually, remove this grep if you want to see the wasm in the output