#!/bin/bash
set -e

current_dir="$(dirname "$0")"
source "${current_dir}/../utils.sh"
  
canisters=("wallet" "auth" "rs" "modclub" "vesting" "airdrop" )
dev_env="${ENV:-qa}"

printf "current DEV_ENV=${dev_env}"

function create_canisters() {
  local env=$1

  dfx identity use default
  for canister in "${canisters[@]}"; do
    local cn=$(get_canister_name_by_env "$env" "$canister")
    dfx canister create "$cn"
  done

  dfx canister create "$(get_canister_name_by_env $env "modclub")_assets"
  
  wait
  return 0
}

function build_canisters() {
  local env=$1

  dfx identity use default
  for canister in "${canisters[@]}"; do
    local cn=$(get_canister_name_by_env "$env" "$canister")
    dfx build "$cn"
  done

  dfx build "$(get_canister_name_by_env $env "modclub")_assets" 
  
  return 0
}

create_canisters $dev_env && build_canisters $dev_env

