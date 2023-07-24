#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

printf "${GREEN}[TEST] ${CYAN}[System] ${YELLOW}Modclub Reputation Score System test module...${NC}\n"

dfx identity use qa_ledger_identity
declare LEDGER_ACCOUNT=$(dfx identity get-principal)
dfx identity use default
dfx ledger fabricate-cycles --canister modclub_qa
dfx ledger fabricate-cycles --canister modclub_qa

declare DEPLOYER_ACCOUNT=$(dfx identity get-principal)
declare MODCLUB_CANISTER_ID=$(dfx canister id modclub_qa)
declare TOKEN_DECIMALS="_000_000"

# Check a is equal to b
function check_equal() {
    if [[ $1 = $2 ]]; then
        printf "${GREEN}[RESULT] Correct: $1, is equal to: $2 ${NC}\n"
    else
        printf "${RED}[RESULT]Incorrect: $1, is not equal to: $2 ${NC}\n"
    fi
}
function check_less() {
    if [[ $1 < $2 ]]; then
        printf "${GREEN}[RESULT]Correct: $1, is less than: $2 ${NC}\n"
    else
        printf "${RED}[RESULT]Inorrect: $1, is NOT less than: $2 ${NC}\n"
    fi
}
function check_greater() {
    if [[ $1 > $2 ]]; then
        printf "${GREEN}[RESULT]Correct: $1, is greater than: $2 ${NC}\n"
    else
        printf "${RED}[RESULT]Inorrect: $1, is NOT greater than: $2 ${NC}\n"
    fi
}

printf "+++++++++++++++++++ ${YELLOW} Step 1: create Provider and setup environments  ${NC}\n"
if ! dfx identity use mod_provider >/dev/null 2>&1; then
    dfx identity new mod_provider --disable-encryption
    dfx identity use mod_provider
fi
declare TEST_PROVIDER_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
dfx canister call auth_qa registerAdmin '(principal "'$DEPLOYER_ACCOUNT'")'
dfx canister call modclub_qa addToAllowList '(principal "'$TEST_PROVIDER_PRINCIPAL'" )'
dfx identity use mod_provider
dfx canister call modclub_qa registerProvider "(\""PROVIDER"\",\""DESCRIPTION_PROVIDER_A"\", null)"
dfx canister call modclub_qa addProviderAdmin "(principal \"$(dfx identity get-principal)\" , \""PROVIDER_NAME"\", null)"
dfx canister call modclub_qa updateSettings "(principal \"$(dfx identity get-principal)\", record {requiredVotes=1; minStaked=0})"
dfx canister call modclub_qa addRules '(vec{"1st-Rule"},null)'
dfx identity use default
echo "Transfering Tokens to QA_Provider main account..."
dfx canister call wallet_qa transferToProvider '( record { from = record { owner = principal "'$LEDGER_ACCOUNT'" }; to = record { owner= principal "'$TEST_PROVIDER_PRINCIPAL'" }; amount = 10_000_000'$TOKEN_DECIMALS' })'

dfx identity use default
dfx canister call modclub_qa setRandomization '(false)'
printf "###### ${YELLOW} Step 2: Check Moderator with Novice and Senior status ########  ${NC}\n"
if ! dfx identity use mod_senior >/dev/null 2>&1; then
    dfx identity new mod_senior --disable-encryption
    dfx identity use mod_senior
fi
dfx canister call modclub_qa registerModerator '("MOD_SENIOR", null,null)'
declare MOD_SENIOR=$(dfx identity get-principal)
if ! dfx identity use mod_junior >/dev/null 2>&1; then
    dfx identity new mod_junior --disable-encryption
    dfx identity use mod_junior
fi
dfx canister call modclub_qa registerModerator '("MOD_JUNIOR", null,null)'
declare MOD_JUNIOR=$(dfx identity get-principal)
if ! dfx identity use mod_novice >/dev/null 2>&1; then
    dfx identity new mod_novice --disable-encryption
    dfx identity use mod_novice
fi
dfx canister call modclub_qa registerModerator '("MOD_NOVICE", null,null)'
declare MOD_NOVICE=$(dfx identity get-principal)
declare RULES="$TEST_PROVIDER_PRINCIPAL"-rule-1

printf "${YELLOW}#### STEP 3: Set RS score to Novice to Senior account  ${NC}\n"
dfx identity use default
dfx canister call rs_qa setRS "(principal \"$MOD_SENIOR\", 6900)"
dfx canister call rs_qa setRS "(principal \"$MOD_JUNIOR\", 4900)"
dfx canister call rs_qa setRS "(principal \"$MOD_NOVICE\", 500)"

printf "${YELLOW}#### STEP 4: Start creating content for vote ${NC}\n"
dfx identity use mod_provider
dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$(dfx identity get-principal)'" } )'
echo "Creating Approve..."
dfx canister call wallet_qa icrc2_approve '( record { spender = principal "'$(dfx canister id modclub_qa)'"; amount = 10_000'$TOKEN_DECIMALS' } )'
echo "TopUp Provider Subaccount..."
dfx canister call modclub_qa topUpProviderReserve '( record { amount = 10_000'$TOKEN_DECIMALS' } )'
echo "Check Provider RESERVE balance"
dfx canister call wallet_qa icrc2_approve '( record { spender = principal "'$(dfx canister id modclub_qa)'"; amount = 10_000'$TOKEN_DECIMALS' } )'
echo "TopUp Provider Subaccount..."
dfx canister call modclub_qa topUpProviderReserve '( record { amount = 10_000'$TOKEN_DECIMALS' } )'
declare P_BAL_BEFORE_SUBMIT=$(dfx canister call modclub_qa providerSaBalance '("RESERVE",null)')
echo "Provider RESERVE balance: $P_BAL_BEFORE_SUBMIT"
for i in {1..15}; do
    dfx canister call modclub_qa submitText "(\""$i"\",\"Text"$i"\", opt \"TitleText"$i"\")"
done
dfx identity use mod_novice
declare PREV_LV=$(dfx canister call rs_qa queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
printf "${YELLOW}#### STEP 5 :.......#VOTE#....... ${NC}\n"
echo "Start generate 10 approved vote for novice "
for j in {1..10}; do
    dfx canister call modclub_qa vote "(\""$TEST_PROVIDER_PRINCIPAL"-content-"$j"\", variant {approved}, null)"
done
echo "Start generate 5 rejected vote for novice"
for j in {11..15}; do
    dfx canister call modclub_qa vote "(\""$TEST_PROVIDER_PRINCIPAL"-content-"$j"\", variant {rejected}, opt vec {\"$RULES\"})"
done
dfx identity use mod_senior
declare MOD_SENIOR_LV=$(dfx canister call rs_qa queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
dfx canister call modclub_qa reserveContent "(\""$TEST_PROVIDER_PRINCIPAL"-content-1""\")"
echo "#### Run Senior votes and check the value in Novice account (5 INCORRECT APPROVED) "
dfx canister call modclub_qa vote "(\""$TEST_PROVIDER_PRINCIPAL"-content-1""\", variant {rejected}, opt vec {\""$RULES"\"})"
echo "Currrent MOD_NOVICE RS(500 pts) deducted by 200 pts MUST equal to 300 pts"
dfx identity use mod_novice
declare CUR_LV=$(dfx canister call rs_qa queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
check_equal $CUR_LV $((PREV_LV - 200))
dfx identity use mod_senior
for j in {2..5}; do
    dfx canister call modclub_qa reserveContent "(\""$TEST_PROVIDER_PRINCIPAL"-content-"$j"\")"
    dfx canister call modclub_qa vote "(\""$TEST_PROVIDER_PRINCIPAL"-content-"$j"\", variant {rejected}, opt vec {\"$RULES\"})"
done

dfx identity use mod_novice
echo "Currrent MOD_NOVICE RS should be less than previous rs_qa point"
declare NOVICE_NV_LV=$(dfx canister call rs_qa queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
check_less $NOVICE_NV_LV $PREV_LV

printf "${YELLOW}--------Check MOD_SENIOR RS point after:------------- ${NC}\n"
dfx identity use mod_senior
declare SENIOR_NV_LV=$(dfx canister call rs_qa queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
check_greater $SENIOR_NV_LV $MOD_SENIOR_LV
echo "and must equal to 6_950, from 13 votes"
check_equal $SENIOR_NV_LV 6_950
