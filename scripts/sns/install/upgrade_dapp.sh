#!/usr/bin/env bash

# This script is used to create an SNS proposal for increasing the cost of proposal rejection to 200 MOD
# This script is called by upgrade_test_canister.sh
# For detailed explanation please see the GitHub Repo: https://github.com/dfinity/sns-testing/tree/main


set -euo pipefail

CURRENTDIR="$(pwd)"

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

REPODIR="$(pwd)"

. ./constants.sh normal

export DEVELOPER_NEURON_ID="194d3f742383afcee2f3fb4a1075aa6f9652f0299bc65cb3da353265206814b0"

cd "${CURRENTDIR}"

# See the proposal format at https://internetcomputer.org/docs/current/developer-docs/integrations/sns/managing/managing-nervous-system-parameters
quill sns  \
   --canister-ids-file "${REPODIR}/sns_canister_ids.json" \
   --pem-file "${PEM_FILE}" \
   make-proposal --proposal \
    "(record { \
       title = \"Increase Proposal Rejection Cost\"; \
       url = \"https://example.com/\"; \
       summary = \"Proposal to increase the rejection cost to 200 MOD\"; \
       action = opt variant { \
           ManageNervousSystemParameters = record { \
               default_followees = null; \
               max_dissolve_delay_seconds = null; \
               max_dissolve_delay_bonus_percentage = null; \
               max_followees_per_function = null; \
               neuron_claimer_permissions = null; \
               neuron_minimum_stake_e8s = null; \
               max_neuron_age_for_age_bonus = null; \
               initial_voting_period_seconds = null; \
               neuron_minimum_dissolve_delay_to_vote_seconds = null; \
	           reject_cost_e8s = opt (200_000_000 : nat64); \
               max_proposals_to_keep_per_action = null; \
               wait_for_quiet_deadline_increase_seconds = null; \
               max_number_of_neurons = null; \
               transaction_fee_e8s = null; \
               max_number_of_proposals_with_ballots = null; \
               max_age_bonus_percentage = null; \
               neuron_grantable_permissions = null; \
               voting_rewards_parameters = null; \
               maturity_modulation_disabled = null; \
               max_number_of_principals_per_neuron = null; \
           } \
       } \
   })" \
   "${DEVELOPER_NEURON_ID}" > msg.json
quill send \
  --insecure-local-dev-mode \
  --yes msg.json | grep -v "new_canister_wasm"