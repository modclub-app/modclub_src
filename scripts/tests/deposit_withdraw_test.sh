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
function check_greater() {
    if [[ $1 > $2 ]]; then
        printf "${GREEN}[RESULT]Correct: $1, is greater than: $2 ${NC}\n"
    else
        printf "${RED}[RESULT]Incorrect: $1, is NOT greater than: $2 ${NC}\n"
    fi
}
dfx identity use qa_ledger_identity
declare LEDGER_ACCOUNT=$(dfx identity get-principal)
declare MODCLUB_CANISTER_ID=$(dfx canister id modclub_qa)
if ! dfx identity use mod_test >/dev/null 2>&1; then
	dfx identity new mod_test --disable-encryption
	dfx identity use mod_test
fi
declare MOD_PRINCIPAL=\"$(dfx identity get-principal)\"
echo "###### Check Moderator Deposit ########"
declare SUB_MOD=$(dfx canister call modclub_qa getProfileById '(principal '"$MOD_PRINCIPAL"')' | grep -E 'record \{ "ACCOUNT_PAYABLE"; blob "[a-f0-9]+"' | head -n 1 | grep -oE 'blob "[a-f0-9]+"')
declare INIT_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal '"$MOD_PRINCIPAL"'; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)

echo  $INIT_MOD_BALANCE
dfx identity use qa_ledger_identity
dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal '"$MOD_PRINCIPAL"'}; amount = 100_000'$TOKEN_DECIMALS' } )'
dfx identity use mod_test
dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'}; amount = 10_000'$TOKEN_DECIMALS' } )'
declare CUR_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)
echo $CUR_MOD_BALANCE
check_greater $CUR_MOD_BALANCE $INIT_MOD_BALANCE 


echo "###### Check Moderator Withdraw ########"
dfx identity use mod_test
dfx canister call modclub_qa withdrawModeratorReward '(100_000, opt principal '"$MOD_PRINCIPAL"')'
declare NEXT_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)
echo $NEXT_MOD_BALANCE
check_less $NEXT_MOD_BALANCE $CUR_MOD_BALANCE 