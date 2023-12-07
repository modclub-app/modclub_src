
dfx_deploy() {
    local cmd="dfx deploy $@"
    if [[ $BYPASS_PROMPT_YES == "yes" || $BYPASS_PROMPT_YES == "Yes" || $BYPASS_PROMPT_YES == "YES" ]]; then
        cmd+=" --yes"
    fi
    eval $cmd
}

function deploy_canisters() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3

  export DEV_ENV=$env
  local env_vars=$(get_env_canisters_vars $env $network $old_modclub_inst)

  # hardcode the ledger identities for now.
  local ledger_minter_identity=qa_ledger_minter
  local ledger_account_identity=qa_ledger_identity

  local modclub_canister_name=$(get_canister_name_by_env $env "modclub")
  local rs_canister_name=$(get_canister_name_by_env $env "rs")
  local wallet_canister_name=$(get_canister_name_by_env $env "wallet")
  local auth_canister_name=$(get_canister_name_by_env $env "auth")
  local assets_canister_name="$(get_canister_name_by_env $env "modclub")_assets"
  local airdrop_canister_name=$(get_canister_name_by_env $env "airdrop")
  local archive_canister_name=$(get_canister_name_by_env $env "archive")

  log "Deploy ${env} Canisters..."

  dfx_deploy ${auth_canister_name} --network=${network} --argument="'(${env_vars})'" &&
  deploy_wallet_canister $env $network $ledger_minter_identity $ledger_account_identity &&
  deploy_vesting_canister $env $network $old_modclub_inst &&
  dfx_deploy ${airdrop_canister_name} --network=${network} --argument="'(${env_vars})'" &&  

  dfx_deploy ${rs_canister_name} --network=${network} --argument="'(${env_vars})'" &&
  dfx_deploy ${modclub_canister_name} --network=${network} --argument="'(${env_vars})'" &&
  dfx_deploy ${archive_canister_name} --network=${network} --argument="'(${env_vars})'" &&
  init_canisters $env &&
  generate_declarations $env &&
  node "$current_dir/../build/gen_files_by_env.cjs" &&
  DEV_ENV=$env dfx_deploy ${assets_canister_name} --network=${network} &&
  log "${env} Canisters DEPLOYED"
  return 0;
}

# Run init
function init_canisters() {
  local env=$1

  local modclub_canister_name=$(get_canister_name_by_env $env "modclub")

  log "Init ${env} Canisters..."
  dfx canister call ${modclub_canister_name} adminInit &&
  dfx canister call ${modclub_canister_name} configurePohForProvider "(principal \"$(dfx canister id ${modclub_canister_name})\", vec {\"challenge-user-audio\";\"challenge-user-video\"}, 365, false)" &&
  dfx canister call ${modclub_canister_name} populateChallenges
  log "${env} Canisters INITIALIZED"
  return 0;
}

function deploy_wallet_canister() {
  local env=$1
  local network=$2

  local ledger_minter_identity=$3
  local ledger_account_identity=$4


  if ! dfx identity use $ledger_minter_identity >/dev/null 2>&1; then
		dfx identity new $ledger_minter_identity --disable-encryption
	fi
  dfx identity use $ledger_minter_identity
  local minter_principal=$(dfx identity get-principal)

	if ! dfx identity use $ledger_account_identity >/dev/null 2>&1; then
		dfx identity new $ledger_account_identity --disable-encryption
	fi
  dfx identity use $ledger_account_identity
  local ledger_acc_principal=$(dfx identity get-principal)

  dfx identity use default 

  local ARCHIVE_CONTROLLER=$(dfx identity get-principal)
  local airdrop_canister_name=$(get_canister_name_by_env $env "airdrop")
  local airdrop_canister_id=$(dfx canister id ${airdrop_canister_name} --network=${network})
  
  local TOKEN_NAME="Modclub_Token"
  local TOKEN_SYMBOL=MODT

  local wallet_canister_name=$(get_canister_name_by_env $env "wallet")

  local wallet_arg='(variant { Init = 
      record {
        token_name = "'${TOKEN_NAME}'";
        token_symbol = "'${TOKEN_SYMBOL}'";
        minting_account = record { owner = principal "'${minter_principal}'";};
        initial_balances = vec {
          record { record { owner = principal "'${ledger_acc_principal}'"; }; 100_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "-------------------------RESERVE"}; 367_500_000_000_000; };
          record { record { owner = principal "'${airdrop_canister_id}'"; subaccount = null}; 10_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "-----------------------MARKETING"}; 50_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "------------------------ADVISORS"}; 50_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "-------------------------PRESEED"}; 62_500_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "----------------------PUBLICSALE"}; 100_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "----------------------------SEED"}; 100_000_000_000_000; };
          record { record { owner = principal "'${ledger_acc_principal}'"; subaccount = opt blob "----------------------------TEAM"}; 160_000_000_000_000; };
        };
        metadata = vec {};
        transfer_fee = 10;
        archive_options = record {
          trigger_threshold = 2000;
          num_blocks_to_archive = 1000;
          controller_id = principal "'${ARCHIVE_CONTROLLER}'";
        }
  }})'
  wallet_arg="'$wallet_arg'"

  echo $wallet_arg

  dfx_deploy ${wallet_canister_name} --network=${network}  --argument=$wallet_arg
  return 0;
}

function get_env_canisters_vars() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3

  local modclub_canister_name=$(get_canister_name_by_env $env "modclub")
  local rs_canister_name=$(get_canister_name_by_env $env "rs")
  local wallet_canister_name=$(get_canister_name_by_env $env "wallet")
  local auth_canister_name=$(get_canister_name_by_env $env "auth")
  local vesting_canister_name=$(get_canister_name_by_env $env "vesting")
  local archive_canister_name=$(get_canister_name_by_env $env "archive")

  local wallet_canister_id=$(dfx canister id ${wallet_canister_name} --network=${network})

  if [ "$wallet_canister" != "" ]; then
    wallet_canister_id=$wallet_canister
  fi

  echo "record { modclub_canister_id = principal \"$(dfx canister id ${modclub_canister_name} --network=${network})\"; old_modclub_canister_id = principal \"${old_modclub_inst}\"; rs_canister_id = principal \"$(dfx canister id ${rs_canister_name} --network=${network})\"; wallet_canister_id = principal \"${wallet_canister_id}\"; auth_canister_id = principal \"$(dfx canister id ${auth_canister_name} --network=${network})\"; vesting_canister_id = principal \"$(dfx canister id ${vesting_canister_name} --network=${network})\"; archive_canister_id = principal \"$(dfx canister id ${archive_canister_name} --network=${network})\"; }"
}


function deploy_vesting_canister() {
  local env=$1
  local network=$2
  local old_modclub_inst=$3

  local env_vars=$(get_env_canisters_vars $env $network $old_modclub_inst)
  
  # Handle "prod" environment separately
  local canister_name=$(get_canister_name_by_env $env "vesting")

  dfx_deploy ${canister_name} --network=${network} --argument="'($env_vars)'"
  dfx generate ${canister_name} -v
  return 0;
}