#!/bin/bash

function get_local_canisters() {
  echo "record { modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; old_modclub_canister_id = principal \"bkyz2-fmaaa-aaaaa-qaaaq-cai\"; rs_canister_id = principal \"$(dfx canister id rs_qa)\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa)\"; auth_canister_id = principal \"$(dfx canister id auth_qa)\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa)\"; archive_canister_id = principal \"$(dfx canister id archive_qa)\"; }"
}

function deploy_archive() {
  export DEV_ENV=qa
  local local_env=$(get_local_canisters)

  dfx deploy archive_qa --argument="($local_env)"
  dfx deploy modclub_qa --argument="($local_env)"
}

deploy_archive