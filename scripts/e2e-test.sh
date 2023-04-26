#!/bin/bash

# MOD-220
echo "MOD-220 E2E Test Start!!"

declare -i MILLION=1000000

# Expected balances
declare -i RESERVE_BALANCE=$((3675 * (MILLION)/10))
declare -i AIRDROP_BALANCE=$((10 * MILLION))
declare -i MARKETING_BALANCE=$((50 * MILLION))
declare -i ADVISORS_BALANCE=$((50 * MILLION))
declare -i PRESEED_BALANCE=$((625 * (MILLION)/10))
declare -i PUBLICSALE_BALANCE=$((100 * MILLION))
declare -i MAIN_BALANCE=$((100 * MILLION))
declare -i SEED_BALANCE=$((100 * MILLION))
declare -i TEAM_BALANCE=$((160 * MILLION))
declare -i TEMP_BALANCE=0

# Verify balances
function verify_balance() {
    local balance_name=$1
    local expected_balance=$2
    local returned_balance=$(dfx canister call wallet queryBalancePr "(principal \"$(dfx canister id modclub)\", opt \"$balance_name\")" | cut -d '(' -f 2 | cut -d " " -f 1)

    if [[ $returned_balance == $expected_balance ]]; then
        echo "Balance for $balance_name is correct: $expected_balance"
    else
        echo "Balance for $balance_name is incorrect! Expected: $expected_balance, Returned: $returned_balance"
    fi
}

# Check a is equal to b
function check_equal() {
    if [[ $1 = $2 ]]
    then
        echo "No update, the initial: $1, and current: $2"
    else
        echo "Balance is update from the initial: $1 to current: $2"
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
        dfx canister create modclub && dfx canister create wallet && dfx canister create rs
        dfx deploy modclub --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\";}})"
        dfx deploy wallet --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\";}})"
        dfx deploy rs --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\";}})"

        echo -n "WALLET CANISTER ID: "
        dfx canister id wallet
        # call registerAdmin
        echo "++++++++++++++++++++Setup has started++++++++++++++++++++"
        dfx canister call wallet registerAdmin "( principal \"$(dfx identity get-principal)\" )"
        dfx canister call wallet tge
        dfx canister call modclub registerAdmin "( principal \"$(dfx identity get-principal)\" )"
        DEFAULT_PRINCIPAL=$(dfx identity get-principal)
        # set of accounts
        echo "++++++++++++++++++++ Check Initial value ++++++++++++++++++++"
        declare -a users=("TREASURY" "RESERVE" "AIRDROP" "MARKETING" "ADVISORS" "PRESEED" "PUBLICSALE" "MAIN" "SEED" "TEAM" "AP" "STAKE" )
        for user in "${users[@]}"
        do
            echo -n "$user | "
            dfx canister call wallet queryBalance "(opt \"$user\")"
        done

        echo "++++++++++Check Balance++++++++++"
        verify_balance "RESERVE" $RESERVE_BALANCE
        verify_balance "AIRDROP" $AIRDROP_BALANCE
        verify_balance "MARKETING" $MARKETING_BALANCE
        verify_balance "ADVISORS" $ADVISORS_BALANCE
        verify_balance "PRESEED" $PRESEED_BALANCE
        verify_balance "PUBLICSALE" $PUBLICSALE_BALANCE
        verify_balance "MAIN" $MAIN_BALANCE
        verify_balance "SEED" $SEED_BALANCE
        verify_balance "TEAM" $TEAM_BALANCE

        # create provider
        echo "+++++++++++++++++++ Step 1: create Provider"
        dfx canister call modclub addToAllowList "(principal \"$(dfx identity get-principal)\" )"
        dfx canister call modclub registerProvider "(\""TEMP_PROVIDER_NAME"\",\""DESCRIPTION_A"\", null)"
        dfx canister call modclub addProviderAdmin "(principal \"$(dfx identity get-principal)\" , \""TEMP_PROVIDER_NAME"\", null)"
        dfx canister call modclub updateSettings "(principal \"$(dfx identity get-principal)\", record {minVotes=1; minStaked=0})"

        # add mod token
        echo "+++++++++++++++++++ Step 2: Mod tokens +++++++++++++++++++"
        dfx canister call wallet queryBalancePr "(principal \"$(dfx canister id wallet)\", null)"
        dfx canister call wallet transferToProvider "(principal \"$(dfx canister id modclub)\",opt \""MAIN"\", principal \"$(dfx canister id modclub)\",opt \"$(dfx identity get-principal)"RESERVE"\", 1000.0 )"
        TEMP_BALANCE=$(($TEMP_BALANCE + 1000))
        echo "Check balance"
        dfx canister call wallet queryBalancePr "(principal \"$(dfx canister id modclub)\", opt \"$(dfx identity get-principal)"RESERVE"\")"
        dfx canister call wallet queryBalancePr "(principal \"$(dfx canister id modclub)\", opt \""AIRDROP"\")"
        # Submit a task and verify
        echo "+++++++++++++++++++ Step 3: Call submitText and check amount of tokens  +++++++++++++++++++"
        dfx canister call modclub submitText '("01","Text", opt "TitleText")'
        TEMP_BALANCE=$(($TEMP_BALANCE - 3))
        echo "------- Check balance after call submitText ---------"
        reserver_principal=$(dfx identity get-principal)"RESERVE"
        verify_balance $reserver_principal $TEMP_BALANCE
        echo "Test: Balance check after submitText"
        echo "+++++++++++++++++++ Step 3.2: Call submitHtmlContent and check amount of tokens +++++++++++++++++++"
        dfx canister call modclub submitHtmlContent '("02","HTML", opt "TitleHTML")'
        TEMP_BALANCE=$(($TEMP_BALANCE - 3))
        verify_balance $reserver_principal $TEMP_BALANCE

        echo "###### Step 5: create Moderator with Junior status ########"
        dfx identity use default
        dfx canister call rs registerAdmin "( principal \"$(dfx identity get-principal)\" )"
        dfx identity use mod_ja
        dfx canister call modclub registerModerator '("TEMP_MOD_JA", null,null)'
        INITIAL_BALANCE=$(dfx canister call wallet queryBalance | cut -d '(' -f 2 | cut -d " " -f 1)
        MOD_PRINCIPAL=\"$(dfx identity get-principal)\"
        echo "#### MOD_PRINCIPAL: $MOD_PRINCIPAL"
        dfx identity use default
        dfx canister call rs setRS "(principal $MOD_PRINCIPAL, 69.0)"
        dfx canister call modclub addToApprovedUser "(principal $MOD_PRINCIPAL )"
        dfx canister call modclub shuffleContent
        for i in {3..20}
        do
            dfx canister call modclub submitText "(\""$i"\",\"Text"$i"\", opt \"TitleText"$i"\")"
        done
        dfx identity use mod_ja
        INITIAL_LEVEL=$(dfx canister call rs queryRSAndLevel)
        dfx canister call modclub getTasks '(0, 30, false)'
        echo "......#VOTE#......."
        for j in {1..20}
        do
            dfx canister call modclub vote "(\""$DEFAULT_PRINCIPAL"-content-"$j"\", variant {approved}, null)"
        done
        echo "......#Check RS Level#......."
        echo "queryRSAndLevel From: $INITIAL_LEVEL"
        echo "To: "
        dfx canister call rs queryRSAndLevel
        echo "queryRSAndLevelByPrincipal: "
        dfx canister call rs queryRSAndLevelByPrincipal "(principal \"$(dfx identity get-principal)\")"
        echo "----------Check Mod token----------"
        CURRENT_BALANCE=$(dfx canister call wallet queryBalance | cut -d '(' -f 2 | cut -d " " -f 1)
        check_equal $INITIAL_BALANCE $CURRENT_BALANCE
        echo "-------------------------------"
    ;;
esac
