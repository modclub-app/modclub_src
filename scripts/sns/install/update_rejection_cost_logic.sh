#!/usr/bin/env bash

# This script is used to create an SNS proposal for increasing the cost of proposal rejection to 2000 MOD


set -euo pipefail

CURRENTDIR="$(pwd)"

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

SCRIPT_DIR="$(pwd)"
REPO_DIR="$SCRIPT_DIR/../../../"

. ./constants.sh normal

export DEVELOPER_NEURON_ID="194d3f742383afcee2f3fb4a1075aa6f9652f0299bc65cb3da353265206814b0"

cd "${CURRENTDIR}"

# See the proposal format at https://internetcomputer.org/docs/current/developer-docs/integrations/sns/managing/managing-nervous-system-parameters
# For the other parameters, other than rejection cost, if you want to update change the values accordingly.
# default_followees = opt record { followees = vec {} }; has been removed from proposal for error handling!
quill sns  \
--canister-ids-file "${REPO_DIR}/sns_canister_ids.json" \
--pem-file "${PEM_FILE}" \
make-proposal --proposal \
"(record { \
       title = \"Increase proposal rejection cost\"; \
       url = \"https://modclub.ai.com/\"; \
       summary = \"Proposal to increase the rejection cost to 2000 MOD in order to reduce the risk of spam proposals.\"; \
       action = opt variant { \
           ManageNervousSystemParameters = record { \
              voting_rewards_parameters = opt record {
      final_reward_rate_basis_points = opt (150 : nat64);
      initial_reward_rate_basis_points = opt (150 : nat64);
      reward_rate_transition_duration_seconds = opt (94_672_800 : nat64);
      round_duration_seconds = opt (86_400 : nat64);
    };
    maturity_modulation_disabled = opt false;
    max_number_of_principals_per_neuron = opt (5 : nat64);
    neuron_claimer_permissions = opt record {
      permissions = vec { 0 : int32; 1 : int32; 2 : int32; 3 : int32; 4 : int32; 5 : int32; 6 : int32; 7 : int32; 8 : int32; 9 : int32; 10 : int32;};
    };
    neuron_minimum_stake_e8s = opt (3_600_000_000 : nat64);
    max_neuron_age_for_age_bonus = opt (63_115_200 : nat64);
    initial_voting_period_seconds = opt (345_600 : nat64);
    neuron_minimum_dissolve_delay_to_vote_seconds = opt (2_629_800 : nat64);
    reject_cost_e8s = opt (200_000_000_000 : nat64);
    max_proposals_to_keep_per_action = opt (100 : nat32);
    wait_for_quiet_deadline_increase_seconds = opt (86_400 : nat64);
    max_number_of_neurons = opt (200_000 : nat64);
    transaction_fee_e8s = opt (10_000 : nat64);
    max_number_of_proposals_with_ballots = opt (700 : nat64);
    max_age_bonus_percentage = opt (25 : nat64);
    neuron_grantable_permissions = opt record {
      permissions = vec { 0 : int32; 1 : int32; 2 : int32; 3 : int32; 4 : int32; 5 : int32; 6 : int32; 7 : int32; 8 : int32; 9 : int32; 10 : int32;};
    };
    max_dissolve_delay_seconds = opt (31_557_600 : nat64);
    max_dissolve_delay_bonus_percentage = opt (100 : nat64);
    max_followees_per_function = opt (15 : nat64);
           } \
       } \
})" \
"${DEVELOPER_NEURON_ID}" > msg.json
quill send \
--yes msg.json
