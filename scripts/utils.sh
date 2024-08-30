# utils.sh


# Usage:
# get_canister_name_by_env <env> <name>
get_canister_name_by_env() {
  local env="$1"
  local name="$2"

  if [ "$env" = "production" ] || [ "$env" = "prod" ] || [ "$env" = "local" ]; then
    echo "$name"
  else
    echo "${name}_${env}"
  fi
}

# generate canister declariations
# generate_declarations <env> <network>
function generate_declarations() {
  local current_dir="$(dirname "$0")"
  local network="${2:-local}"  # Default to 'local' if not provided
  local m=$(get_canister_name_by_env "$1" "modclub")
  local w=$(get_canister_name_by_env "$1" "wallet")
  local v=$(get_canister_name_by_env "$1" "vesting")
  local r=$(get_canister_name_by_env "$1" "rs")
  local a=$(get_canister_name_by_env "$1" "airdrop")
  
  dfx generate "$m" --network=$network -v &&
  dfx generate "${m}_assets" --network=$network -v &&
  dfx generate "$w" --network=$network -v &&
  dfx generate "$v" --network=$network -v &&
  dfx generate "$r" --network=$network -v &&
  dfx generate "$a" --network=$network -v &&
  return 0;

  echo "[ERROR] Impossible to generate declarations" && exit 1
}


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    printf "${GREEN}[TEST] ${CYAN}[INFRA] ${YELLOW}$1${NC}\n"
}

log_step() {
    printf "${GREEN}[STEP] ${CYAN}$1${NC}\n"
}

error() {
    printf "${RED}[ERROR] $1${NC}\n"
    exit 1
}