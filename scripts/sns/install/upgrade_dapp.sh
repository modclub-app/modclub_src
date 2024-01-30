#!/usr/bin/env bash

# This script is used to create an SNS proposal for increasing the cost of proposal rejection to 200 MOD
# This script is called by upgrade_test_canister.sh
# For detailed explanation please see the GitHub Repo: https://github.com/dfinity/sns-testing/tree/main


set -euo pipefail

CURRENTDIR="$(pwd)"

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

REPODIR="$(pwd)"

. ./constants.sh normal

# Hardcoding the DEVELOPER_NEURON_ID
export DEVELOPER_NEURON_ID="194d3f742383afcee2f3fb4a1075aa6f9652f0299bc65cb3da353265206814b0"

cd "${CURRENTDIR}"

# See the proposal format at https://internetcomputer.org/docs/current/references/quill-cli-reference/sns/quill-sns-make-proposal/
quill sns  \
   --canister-ids-file "${REPODIR}/sns_canister_ids.json"  \
   --pem-file "${PEM_FILE}"  \
   make-proposal --proposal \
   "(record { \
       title = \"SNS Proposal for Changing Proposal Rejection Cost\"; \
       url = \"https://example.com/\"; \
       summary = \"SNS Proposal for Increasing the Cost of Proposal Rejection to 200 MOD\"; \
       action = opt variant { \
           Motion = record { \
               motion_text = \"I hereby propose that the cost of rejecting proposals be increased to 200 MOD\"; \
           } \
       }; \
   })" \
   "${DEVELOPER_NEURON_ID}" > msg.json
quill send \
  --insecure-local-dev-mode \
  --yes msg.json | grep -v "new_canister_wasm"