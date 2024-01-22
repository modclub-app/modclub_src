canisters=("wallet" "auth" "rs" "modclub" "vesting" "crypto_api")

source "scripts/deployment/deployment_utils.sh"

function create_canisters() {
  local env=$1

  dfx identity use default

  local a=$(get_canister_name_by_env "$env" "airdrop")
  dfx canister create "$a"

  for canister in "${canisters[@]}"; do
    local cn=$(get_canister_name_by_env "$env" "$canister")
    dfx canister create "$cn"
  done

  dfx canister create "$(get_canister_name_by_env $env "modclub")_assets"
  
  wait
  return 0;
}

function build_canisters() {
  local env=$1
  local mode=${2:-"normal"}

  if [ "${mode}" == "quick" ]; then
    build_be_canisters_quick "${env}"
  else
    build_be_canisters $env
  fi
  build_fe_canisters $env
  
  return 0;
}

function build_be_canisters() {

  local env=$1

  dfx identity use default
  for canister in "${canisters[@]}"; do
    local cn=$(get_canister_name_by_env "$env" "$canister")
    dfx build "$cn"
  done

  return 0;
}

function build_be_canisters_quick() {
  local env=$1
  local network=${2:-"local"}

  dfx identity use default
  for canister in "${canisters[@]}"; do
    quick_build "$canister" "$env" "$network"
  done
  local cn=$(get_canister_name_by_env "$env" wallet)
  dfx build "$cn"

  return 0;
}

function build_fe_canisters() {
  local env=$1

  dfx identity use default

  dfx build "$(get_canister_name_by_env $env "modclub")_assets" 
  
  return 0;
}