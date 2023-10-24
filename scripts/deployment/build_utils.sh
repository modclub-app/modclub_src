canisters=("wallet" "auth" "rs" "modclub" "vesting" "airdrop" )

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

  build_be_canisters $env
  build_fe_canisters $env
  
  return 0
}

function build_be_canisters() {

  local env=$1

  dfx identity use default
  for canister in "${canisters[@]}"; do
    local cn=$(get_canister_name_by_env "$env" "$canister")
    dfx build "$cn"
  done

  return 0
}

function build_fe_canisters() {
  local env=$1

  dfx identity use default

  dfx build "$(get_canister_name_by_env $env "modclub")_assets" 
  
  return 0
}