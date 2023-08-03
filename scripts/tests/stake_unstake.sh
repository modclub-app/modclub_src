
#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function check_less() {
    if [[ $1 < $2 ]]; then
        printf "${GREEN}[RESULT]Correct: $1, is less than: $2 ${NC}\n"
    else
        printf "${RED}[RESULT]Incorrect: $1, is NOT less than: $2 ${NC}\n"
    fi
}

dfx identity use qa_ledger_identity
declare LEDGER_ACCOUNT=$(dfx identity get-principal)
declare MODCLUB_CANISTER_ID=$(dfx canister id modclub_qa)
echo "###### Check Moderator Stake ########"
if ! dfx identity use mod_test >/dev/null 2>&1; then
	dfx identity new mod_test --disable-encryption
	dfx identity use mod_test
fi
declare MOD_PRINCIPAL=\"$(dfx identity get-principal)\"
declare SUB_MOD=$(dfx canister call modclub_qa getProfileById '(principal '"$MOD_PRINCIPAL"')' | grep -E 'record \{ "ACCOUNT_PAYABLE"; blob "[a-f0-9]+"' | head -n 1 | grep -oE 'blob "[a-f0-9]+"')
declare MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)

dfx canister call modclub_qa stakeTokens '(1_000_000)'
declare STAKE_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)
check_less $STAKE_MOD_BALANCE $MOD_BALANCE 
declare STAKE_MOD_VAL=$(dfx canister call vesting_qa staked_for '(record {owner = principal '"$MOD_PRINCIPAL"'})'| cut -d '(' -f2 | cut -d':' -f1)

echo "###### Check Moderator Unstake ########"
dfx canister call modclub_qa claimStakedTokens '(100_000)'
declare AFTER_STAKE_MOD_VAL=$(dfx canister call vesting_qa staked_for '(record {owner = principal '"$MOD_PRINCIPAL"'})'| cut -d '(' -f2 | cut -d':' -f1)
check_less $AFTER_STAKE_MOD_VAL $STAKE_MOD_VAL