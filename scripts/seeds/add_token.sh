# this lib file contains utils to add tokens 

declare TOKEN_DECIMALS="_000_000"
function add_token_for_submitting_task() {
    log_step "Adding extra tokens to submit tasks"
    local env=$1
    local provider_identity=$2
    local ledger_identity=$3
    local wallet=$(get_canister_name_by_env "$env" "wallet")
    local modclub=$(get_canister_name_by_env "$env" "modclub")
    local modclub_canister_id=$(dfx canister id "$modclub")

    dfx identity use ${provider_identity}
    local provider_principal=$(dfx identity get-principal)


    dfx identity use ${ledger_identity}
    echo "Transfering Tokens to Provider main account..."
    # For imitation that Provider has some amount of Tokens
    local provider_topUp_result=$(dfx canister call "${wallet}" icrc1_transfer '( record { from_subaccount = opt blob "-------------------------RESERVE"; to = record { owner = principal "'$provider_principal'" }; amount = 50_000'$TOKEN_DECIMALS' } )')
    echo $provider_topUp_result


    dfx identity use ${provider_identity}
    local providerSaReserveRaw=$(dfx canister call $modclub getProviderSa '("RESERVE", null)')
    local pSaReserve1=${providerSaReserveRaw#"(blob \""}
    local pSaReserve=${pSaReserve1%"\")"}
    echo "${pSaReserve}"
    local transfer_result=$(dfx canister call $wallet icrc1_transfer '( record { to = record { owner = principal "'$modclub_canister_id'"; subaccount = opt blob "'$pSaReserve'" }; amount = 10_000_000_000 } )')


    echo "Check Modclub canister balance"
    dfx canister call $wallet icrc1_balance_of '( record { owner = principal "'$modclub_canister_id'"; subaccount = opt blob "'$pSaReserve'" } )'

    log_step "Done add_token_for_submitting_task"
}

function add_token_to_ACCOUNT_PAYABLE() {
    log_step "Adding extra tokens to ACCOUNT_PAYABLE"
    local env=$1
    local ledger_identity=$2
    dfx identity use ${ledger_identity}
    local wallet=$(get_canister_name_by_env "$env" "wallet")
    local modclub=$(get_canister_name_by_env "$env" "modclub")
    local modclub_canister_id=$(dfx canister id "$modclub")
    dfx canister call ${wallet} icrc1_transfer '(record { to = record { owner = principal "'$modclub_canister_id'"; subaccount = opt blob "-----------------ACCOUNT_PAYABLE" }; amount = 10_000_000_000:nat })'
    log_step "Done add_token_to_ACCOUNT_PAYABLE"
}