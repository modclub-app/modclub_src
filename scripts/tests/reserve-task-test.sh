#!/bin/bash

declare -i MILLION=1000000

# Expected balances
declare -i RESERVE_BALANCE=$((3675 * (MILLION) / 10))
declare -i AIRDROP_BALANCE=$((10 * MILLION))
declare -i MARKETING_BALANCE=$((50 * MILLION))
declare -i ADVISORS_BALANCE=$((50 * MILLION))
declare -i PRESEED_BALANCE=$((625 * (MILLION) / 10))
declare -i PUBLICSALE_BALANCE=$((100 * MILLION))
declare -i MAIN_BALANCE=$((100 * MILLION))
declare -i SEED_BALANCE=$((100 * MILLION))
declare -i TEAM_BALANCE=$((160 * MILLION))
declare -i TEMP_BALANCE=0

# Declared color
RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
CYAN="\e[36m"
NC="\e[0m" # No Color
ENDCOLOR="\e[0m"

function regist_auth_canister_admins() {
    dfx canister call auth_qa registerAdmin "( principal \"$(dfx identity get-principal)\" )"
}

function check_success() {
    case $1 in

    "moderator")
        if [ $? -ne 0 ]; then
            echo "Error: Failed to register moderator"
        fi
        ;;
    "setVoteParams")
        if [ $? -ne 0 ]; then
            echo "Error: Failed to setVoteParameter"
        fi
        ;;
    esac
}

function failed() {
    if [ $? -ne 0 ]; then
        echo -e "${GREEN}[CORRECT]${ENDCOLOR}  "
    else
        echo -e "${RED}[INCORRECT]${ENDCOLOR}  "
    fi
}
function passed() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}[INCORRECT]${ENDCOLOR}  "
    else
        echo -e "${GREEN}[CORRECT]${ENDCOLOR}  "
    fi
}
# MOD-217
echo -e "${GREEN}[TEST] ${CYAN}[SYSTEM] Content Vote Reseravation Test module... ${ENDCOLOR}"

dfx identity use qa_ledger_identity
declare LEDGER_ACCOUNT=$(dfx identity get-principal)
dfx identity use default
declare DEFAULT_PRINCIPAL=$(dfx identity get-principal)
declare TOKEN_DECIMALS="_000_000"

# call registerAdmin
echo "++++++++++++++++++++Setup Authentication has started++++++++++++++++++++"
regist_auth_canister_admins
dfx canister call modclub_qa setRandomization '(false)'
# create provider
echo "+++++++++++++++++++ Step 1: Create Provider"
if ! dfx identity use mod_provider >/dev/null 2>&1; then
    dfx identity new mod_provider --disable-encryption
    dfx identity use mod_provider
fi
declare MODPROVIDER_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
dfx canister call modclub_qa addToAllowList "(principal \"$MODPROVIDER_PRINCIPAL\" )"
dfx identity use mod_provider
dfx canister call modclub_qa registerProvider "(\""MOD_PROVIDER_NAME"\",\""DESCRIPTION_A"\", null)"
dfx canister call modclub_qa addProviderAdmin "(principal \"$(dfx identity get-principal)\" , \""TEMP_PROVIDER_NAME"\", null)"
dfx identity use default
echo "Transfering Tokens to Modclub..."
dfx canister call wallet_qa transferToProvider '( record { from = record { owner = principal "'$LEDGER_ACCOUNT'" }; to = record { owner= principal "'$MODPROVIDER_PRINCIPAL'" }; amount = 10_000_000'$TOKEN_DECIMALS' })'

echo "+++++++++++++++++++ Step 2: Mod tokens +++++++++++++++++++"
dfx identity use mod_provider
dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$(dfx identity get-principal)'"})'
echo "Creating Approve..."
dfx canister call wallet_qa icrc2_approve '( record { spender = principal "'$(dfx canister id modclub_qa)'"; amount = 10_000'$TOKEN_DECIMALS' } )'
echo "TopUp Provider Subaccount..."
dfx canister call modclub_qa topUpProviderReserve '( record { amount = 10_000'$TOKEN_DECIMALS' } )'
dfx canister call wallet_qa icrc2_approve '( record { spender = principal "'$(dfx canister id modclub_qa)'"; amount = 10_000'$TOKEN_DECIMALS' } )'
dfx canister call modclub_qa topUpProviderReserve '( record { amount = 10_000'$TOKEN_DECIMALS' } )'
echo "Check Provider RESERVE balance"
declare P_BAL_BEFORE_SUBMIT=$(dfx canister call modclub_qa providerSaBalance '("RESERVE",null)')
echo "Provider RESERVE balance: $P_BAL_BEFORE_SUBMIT"

# Submit a task and verify
echo "++++++++++++++ Step 3: create Moderator with Junior status ++++++++++"
if ! dfx identity use mod_test >/dev/null 2>&1; then
    dfx identity new mod_test --disable-encryption
    dfx identity use mod_test
fi
dfx canister call modclub_qa registerModerator '("TEMP_MOD_TEST", null,null)'
check_success "moderator"
declare MOD_PRINCIPAL=\"$(dfx identity get-principal)\"
if ! dfx identity use mod_test_2 >/dev/null 2>&1; then
    dfx identity new mod_test_2 --disable-encryption
    dfx identity use mod_test_2
fi
dfx canister call modclub_qa registerModerator '("TEMP_MOD_TEST2", null,null)'
check_success "moderator"
declare MOD_PRINCIPAL_2=\"$(dfx identity get-principal)\"
if ! dfx identity use mod_test_3 >/dev/null 2>&1; then
    dfx identity new mod_test_3 --disable-encryption
    dfx identity use mod_test_3
fi
dfx canister call modclub_qa registerModerator '("TEMP_MOD_TEST3", null,null)'
check_success "moderator"
declare MOD_PRINCIPAL_3=\"$(dfx identity get-principal)\"
if ! dfx identity use mod_test_4 >/dev/null 2>&1; then
    dfx identity new mod_test_4 --disable-encryption
    dfx identity use mod_test_4
fi
dfx canister call modclub_qa registerModerator '("TEMP_MOD_TEST4", null,null)'
check_success "moderator"
declare MOD_PRINCIPAL_4=\"$(dfx identity get-principal)\"

echo "+++++++++++++++++++ Step 4: submitText  +++++++++++++++++++"
dfx identity use default
dfx ledger fabricate-cycles --canister modclub_qa
dfx ledger fabricate-cycles --canister modclub_qa
echo "+++++++++++++++++++ Step 4.1: Set VoteParams  +++++++++++++++++++"
dfx canister call modclub_qa setVoteParamsForLevel "(3, variant {simple})"
check_success "setVoteParams"
sleep 2
dfx canister call rs_qa setRS "(principal $MOD_PRINCIPAL, 6900)"
dfx identity use mod_provider
declare SUBMIT_01=$(dfx canister call modclub_qa submitText "(\""001"\",\"Text001\", opt \"TitleText001\")"| cut -d '(' -f 2 | cut -d ')' -f -1| cut -d '"' -f 2 | cut -d '"' -f -1)
declare SUBMIT_02=$(dfx canister call modclub_qa submitText "(\""002"\",\"Text002\", opt \"TitleText002\")"| cut -d '(' -f 2 | cut -d ')' -f -1| cut -d '"' -f 2 | cut -d '"' -f -1)
echo $SUBMIT_01 

dfx identity use mod_test
dfx canister call modclub_qa getTasks '(0, 1, false)'
echo "......#VOTE# Case 1 MUST FAILED......."
dfx canister call modclub_qa vote "(\"$SUBMIT_01\", variant {approved}, null)"
failed
dfx identity use mod_test_2
echo "......#VOTE# Case 2 MUST PASSED......."
echo "1"
dfx canister call modclub_qa reserveContent "(\"$SUBMIT_02\")"
dfx canister call modclub_qa reserveContent "(\"$SUBMIT_01\")"
dfx canister call modclub_qa vote "(\"$SUBMIT_01\", variant {approved}, null)"
passed
dfx identity use mod_test
echo "2"
dfx canister call modclub_qa reserveContent "(\"$SUBMIT_01\")"
dfx canister call modclub_qa vote "(\"$SUBMIT_01\", variant {approved}, null)"
passed
dfx identity use mod_test_3
echo "3"
dfx canister call modclub_qa reserveContent "(\"$SUBMIT_01\")"
dfx canister call modclub_qa vote "(\"$SUBMIT_01\", variant {approved}, null)"
passed
echo "......#VOTE# Case 3 MUST FAILED (full)......."
dfx identity use mod_test_4
dfx canister call modclub_qa reserveContent "(\"$SUBMIT_01\")"
failed
echo "......#VOTE# Case 4 MUST FAILED (TimeOut)......."
dfx identity use mod_test_2
echo "sleep for 300 s......"
declare secs=300
while [ $secs -gt 0 ]; do
   echo -ne "$secs\033[0K\r"
   sleep 1
   : $((secs--))
done
echo "Thank you for your patient..."
dfx canister call modclub_qa vote "(\"$SUBMIT_02\", variant {approved}, null)"
failed
echo "-------------------------------"
