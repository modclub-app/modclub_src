# utils.sh


# Usage:
# get_canister_name_by_env <env> <name>
get_canister_name_by_env() {
  local env="$1"
  local name="$2"

  if [ "$env" = "production" ] || [ "$env" = "prod" ]; then
    echo "$env"
  else
    echo "${name}_${env}"
  fi
}

# generate canister declariations
# generate_declariations <env>
function generate_declariations() {
  local current_dir="$(dirname "$0")"
  local m=$(get_canister_name_by_env "$1" "modclub")
  local w=$(get_canister_name_by_env "$1" "wallet")
  local v=$(get_canister_name_by_env "$1" "vesting")
  local r=$(get_canister_name_by_env "$1" "rs")
  
  dfx generate "$m" -v &&
  dfx generate "$w" -v &&
  dfx generate "$v" -v &&
  dfx generate "$r" -v
}