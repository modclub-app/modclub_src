# this lib file contains utils to generate provider

function create_provider_identity() {
    log_step "Creating provider identity: ${PROVIDER_IDENTITY}"
    if ! dfx identity use ${PROVIDER_IDENTITY} >/dev/null 2>&1; then
        dfx identity new ${PROVIDER_IDENTITY} --disable-encryption
        
    fi

    dfx identity use ${PROVIDER_IDENTITY}
    local provider_pricipal=$(dfx identity get-principal)
    log_step "Identity ${PROVIDER_IDENTITY} created with principal: ${provider_pricipal}"
}

function setup_provider() {
    local env=$1
    local provider_identity=$2
    local auth=$(get_canister_name_by_env "$env" "auth")
    local modclub=$(get_canister_name_by_env "$env" "modclub")
    local provider_name="X_company"
    local provider_description="we provide x contents."

    log_step "Setup provider... (identity=${provider_identity})"

    dfx identity use default
    local default_principal=$(dfx identity get-principal)
    dfx identity use ${provider_identity}
    local provider_pricipal=$(dfx identity get-principal)

    dfx identity use default
    dfx canister call ${auth} registerAdmin '(principal "'$default_principal'")'
    dfx canister call ${modclub} addToAllowList '(principal "'$provider_pricipal'" )' || true

    dfx identity use ${provider_identity}
    dfx canister call ${modclub} registerProvider '("'${provider_name}'","'"${provider_description}"'", null)'

    dfx canister call ${modclub} addProviderAdmin '(principal "'$provider_pricipal'" , "'${provider_name}'", null)'
    dfx canister call modclub_qa addRules '(vec {"Incorrect Content"}, opt principal "'$provider_pricipal'")'

    log_step "Finished provider (${provider_identity}  ${provider_pricipal}) setup. "
}