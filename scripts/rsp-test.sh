#!/bin/bash

# Check a is equal to b
function check_equal() {
    if [[ $1 = $2 ]]; then
        echo "Correct: $1, is equal to: $2"
    else
        echo "Incorrect: $1, is not equal to: $2"
    fi
}
function check_less() {
    if [[ $1 < $2 ]]; then
        echo "Correct: $1, is less than: $2"
    else
        echo "Inorrect: $1, is NOT less than: $2"
    fi
}
function check_greater() {
    if [[ $1 > $2 ]]; then
        echo "Correct: $1, is greater than: $2"
    else
        echo "Inorrect: $1, is NOT greater than: $2"
    fi
}
case $1 in
1)
    echo "----------------- Generate Modclub --------------------"
    dfx generate modclub
    dfx deploy modclub --argument="(variant { local = { modclub_canister_id = principal \"$(dfx canister id modclub)\"; rs_canister_id = principal \"$(dfx canister id rs)\"; wallet_canister_id = principal \"$(dfx canister id wallet)\" } })"
    ;;
*)
    dfx identity use default
    # clean up
    rm -rf ../.dfx

    # deploy
    echo "++++++++++++++++++++Deploy has started++++++++++++++++++++"
    dfx canister create modclub && dfx canister create wallet && dfx canister create rs && dfx canister create auth
    dfx deploy auth --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
    dfx deploy modclub --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
    dfx deploy wallet --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
    dfx deploy rs --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"

    # call registerAdmin
    echo "++++++++++++++++++++Setup has started++++++++++++++++++++"
    dfx canister call wallet registerAdmin "( principal \"$(dfx identity get-principal)\" )"
    dfx canister call wallet tge
    dfx canister call modclub registerAdmin "( principal \"$(dfx identity get-principal)\" )"
    DEFAULT_PRINCIPAL=$(dfx identity get-principal)

    # create provider and setup environment
    echo "+++++++++++++++++++ Step 1: create Provider and setup environments"
    dfx canister call modclub addToAllowList "(principal \"$(dfx identity get-principal)\" )"
    dfx canister call modclub registerProvider "(\""TEMP_PROVIDER_NAME"\",\""DESCRIPTION_A"\", null)"
    dfx canister call modclub addProviderAdmin "(principal \"$(dfx identity get-principal)\" , \""TEMP_PROVIDER_NAME"\", null)"
    dfx canister call modclub updateSettings "(principal \"$(dfx identity get-principal)\", record {requiredVotes=1; minStaked=0})"
    dfx canister call modclub addRules '(vec{"Passed"},null)'
    dfx canister call rs registerAdmin "( principal \"$(dfx identity get-principal)\" )"
    dfx canister call modclub setRandomization false

    # add mod token
    echo "++++++++++++++ Step 2: Mod tokens to Provider ++++++++++++++++"
    dfx canister call wallet transferToProvider "(principal \"$(dfx canister id modclub)\",opt \""MAIN"\", principal \"$(dfx canister id modclub)\",opt \"$(dfx identity get-principal)"RESERVE"\", 10000.0 )"
    # Start Novice and Senior
    echo "###### Step 3: Check Moderator with Novice and Senior status ########"
    if ! dfx identity use mod_senior >/dev/null 2>&1; then
        dfx identity new mod_senior --disable-encryption
    fi
    dfx identity use mod_senior
    dfx canister call modclub registerModerator '("TEMP_MOD_SENIOR", null,null)'
    INITIAL_LEVEL=$(dfx canister call rs queryRSAndLevel)
    MOD_SENIOR=\"$(dfx identity get-principal)\"
    if ! dfx identity use mod_novice >/dev/null 2>&1; then
        dfx identity new mod_novice --disable-encryption
    fi
    dfx identity use mod_novice
    dfx canister call modclub registerModerator '("TEMP_MOD_NOVICE", null,null)'
    MOD_NOVICE=\"$(dfx identity get-principal)\"
    echo "#### Set RS score to Novice and Senior account"
    dfx identity use default
    dfx canister call rs setRS "(principal $MOD_SENIOR, 6900)"
    dfx canister call rs setRS "(principal $MOD_NOVICE, 500)"

    #start cases
    echo "#### Start creating content for vote"
    for i in {1..15}; do
        dfx canister call modclub submitText "(\""$i"\",\"Text"$i"\", opt \"TitleText"$i"\")"
    done
    dfx identity use mod_novice
    INITIAL_LEVEL_2=$(dfx canister call rs queryRSAndLevel)
    INIT_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
    RULES=$(dfx canister call modclub getRules "(principal \"$DEFAULT_PRINCIPAL\")" | grep -o 'id = "[^"]*"' | sed 's/id = "//;s/"//')
    # Novice vote
    echo "......#VOTE#......."
    echo "Start generate 10 approved vote for novice "
    for j in {1..10}; do
        dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-"$j"\", variant {approved}, null)"
    done
    echo "Start generate 5 rejected vote for novice"
    for j in {11..15}; do
        dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-"$j"\", variant {rejected}, opt vec {\""$RULES"\"})"
    done
    dfx identity use mod_senior
    SENIOR_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)

    # senior start vote : 1st case
    echo "---------- Run Senior votes and check the value in Novice account (5 INCORRECT APPROVED) ---------"
    dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-1""\", variant {rejected}, opt vec {\""$RULES"\"})"
    echo "Currrent MOD_NOVICE RS check it should have deducted by 200 point"
    dfx identity use mod_novice
    PREV_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
    check_equal $PREV_BALANCE $((INIT_BALANCE - 200))
    dfx identity use mod_senior
    for j in {2..5}; do
        dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-"$j"\", variant {rejected}, opt vec {\""$RULES"\"})"
    done
    dfx identity use mod_novice
    echo "Currrent MOD_NOVICE RS check it should not go below 0"
    PREV_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
    check_equal $PREV_BALANCE 0

    # 2nd case
    echo "---------- Run Senior votes and check the value in Novice account (5 CORRECT APPROVED) ---------"
    dfx identity use mod_senior
    for j in {6..10}; do
        dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-"$j"\", variant {approved}, null)"
    done
    dfx identity use mod_novice
    echo "Currrent MOD_NOVICE RS should equal to the 500 from 5 correct vote"
    NV_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
    check_equal $NV_BALANCE $((PREV_BALANCE + 500))
    PREV_BALANCE=$NV_BALANCE

    # 3rd case
    echo "---------- Run Senior votes and check the value in Novice account (3 INCORRECT REJECTED) ---------"
    dfx identity use mod_senior
    for j in {11..13}; do
        dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-"$j"\", variant {approved}, null)"
    done
    dfx identity use mod_novice
    echo "Currrent MOD_NOVICE RS should be less than previous rs point"
    NV_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
    check_equal $NV_BALANCE $((PREV_BALANCE - 300))

    # 4th case
    echo "-------------Check MOD_SENIOR RS point after:---------------------"
    dfx identity use mod_senior
    SENIOR_CUR_BALANCE=$(dfx canister call rs queryRSAndLevel | cut -d '(' -f 2 | cut -d " " -f 11)
    check_greater $SENIOR_CUR_BALANCE $SENIOR_BALANCE
    echo "and must equal to 7_030, from 13 votes"
    check_equal $SENIOR_CUR_BALANCE 7_030
    ;;
esac
