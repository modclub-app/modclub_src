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
    dfx canister call auth registerAdmin "( principal \"$(dfx identity get-principal)\" )"
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
echo -e "${CYAN}MOD-217 New Tokenomic Test Start!! ${ENDCOLOR}"
dfx identity use default
DEFAULT_PRINCIPAL=$(dfx identity get-principal)
TOKEN_DECIMALS="_000_000"

# deploy
bash setup-local.sh
if [ $? -ne 0 ]; then
    echo -e " setup-failed "
    exit
fi

# call registerAdmin
echo "++++++++++++++++++++Setup Authentication has started++++++++++++++++++++"
regist_auth_canister_admins
dfx canister call modclub setRandomization false
# create provider
echo "+++++++++++++++++++ Step 1: Create Provider"
dfx canister call modclub addToAllowList "(principal \"$(dfx identity get-principal)\" )"
if ! dfx identity use mod_provider >/dev/null 2>&1; then
    dfx identity new mod_provider --disable-encryption
    dfx identity use mod_provider
fi
MODPROVIDER_PRINCIPAL=$(dfx identity get-principal)
echo "add to allow list mod_provider"
dfx identity use default
dfx canister call modclub addToAllowList "(principal \"$MODPROVIDER_PRINCIPAL\" )"
dfx identity use mod_provider
dfx canister call modclub registerProvider "(\""MOD_PROVIDER_NAME"\",\""DESCRIPTION_A"\", null)"
dfx canister call modclub addProviderAdmin "(principal \"$(dfx identity get-principal)\" , \""TEMP_PROVIDER_NAME"\", null)"
dfx identity use default
echo "Transfering Tokens to Modclub..."
dfx canister call wallet transferToProvider '( record { from = record { owner = principal "'$DEFAULT_PRINCIPAL'" }; to = record { owner= principal "'$MODPROVIDER_PRINCIPAL'" }; amount = 1_000_000'$TOKEN_DECIMALS' })'
dfx canister call wallet icrc1_balance_of '( record { owner = principal "'$(dfx canister id modclub)'" } )'

# add mod token
echo "+++++++++++++++++++ Step 2: Mod tokens +++++++++++++++++++"
echo "Creating Approve..."
dfx identity use mod_provider
dfx canister call wallet icrc2_approve '( record { spender = principal "'$(dfx canister id modclub)'"; amount = 1000'$TOKEN_DECIMALS' } )'
echo "TopUp Provider Subaccount..."
dfx canister call modclub topUpProviderReserve '( record { amount = 100'$TOKEN_DECIMALS' } )'
echo "Check Modclub canister balance"
dfx canister call wallet icrc1_balance_of '( record { owner = principal "'$(dfx canister id modclub)'" } )'
echo "Check Provider RESERVE balance"
P_BAL_BEFORE_SUBMIT=$(dfx canister call modclub providerSaBalance '("RESERVE")')
echo "Provider RESERVE ballance: $P_BAL_BEFORE_SUBMIT"

# Submit a task and verify
echo "++++++++++++++ Step 3: create Moderator with Junior status ++++++++++"
if ! dfx identity use mod_test >/dev/null 2>&1; then
    dfx identity new mod_test --disable-encryption
    dfx identity use mod_test
fi
dfx canister call modclub registerModerator '("TEMP_MOD_TEST", null,null)'
check_success "moderator"
INITIAL_BALANCE=$(dfx canister call wallet queryBalance | cut -d '(' -f 2 | cut -d " " -f 1)
MOD_PRINCIPAL=\"$(dfx identity get-principal)\"
if ! dfx identity use mod_test_2 >/dev/null 2>&1; then
    dfx identity new mod_test_2 --disable-encryption
    dfx identity use mod_test_2
fi
dfx canister call modclub registerModerator '("TEMP_MOD_TEST2", null,null)'
check_success "moderator"
INITIAL_BALANCE_2=$(dfx canister call wallet queryBalance | cut -d '(' -f 2 | cut -d " " -f 1)
MOD_PRINCIPAL_2=\"$(dfx identity get-principal)\"
if ! dfx identity use mod_test_3 >/dev/null 2>&1; then
    dfx identity new mod_test_3 --disable-encryption
    dfx identity use mod_test_3
fi
dfx canister call modclub registerModerator '("TEMP_MOD_TEST3", null,null)'
check_success "moderator"
INITIAL_BALANCE_3=$(dfx canister call wallet queryBalance | cut -d '(' -f 2 | cut -d " " -f 1)
MOD_PRINCIPAL_3=\"$(dfx identity get-principal)\"
if ! dfx identity use mod_test_4 >/dev/null 2>&1; then
    dfx identity new mod_test_4 --disable-encryption
    dfx identity use mod_test_4
fi
dfx canister call modclub registerModerator '("TEMP_MOD_TEST4", null,null)'
check_success "moderator"
INITIAL_BALANCE_4=$(dfx canister call wallet queryBalance | cut -d '(' -f 2 | cut -d " " -f 1)
MOD_PRINCIPAL_4=\"$(dfx identity get-principal)\"

echo "+++++++++++++++++++ Step 4: submitText  +++++++++++++++++++"
dfx identity use default
dfx ledger fabricate-cycles --canister modclub
dfx ledger fabricate-cycles --canister modclub
echo "+++++++++++++++++++ Step 4.1: Set VoteParams  +++++++++++++++++++"
dfx canister call modclub setVoteParamsForLevel "(3, variant {simple})"
check_success "setVoteParams"
sleep 2
dfx canister call rs setRS "(principal $MOD_PRINCIPAL, 6900)"
dfx identity use mod_provider
dfx canister call modclub submitText "(\""1"\",\"Text1\", opt \"TitleText1\")"
dfx canister call modclub submitText "(\""2"\",\"Text2\", opt \"TitleText2\")"

dfx identity use mod_test
INITIAL_LEVEL=$(dfx canister call rs queryRSAndLevel)
dfx canister call modclub getTasks '(0, 1, false)'
echo "......#VOTE# Case 1 MUST FAILED......."
RESULT1=$(dfx canister call modclub vote "(\""$MODPROVIDER_PRINCIPAL"-content-1""\", variant {approved}, null)")
failed
dfx identity use mod_test_2
echo "......#VOTE# Case 2 MUST PASSED......."
echo "1"
dfx canister call modclub canReserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
dfx canister call modclub reserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
RESULT2=$(dfx canister call modclub vote "(\""$MODPROVIDER_PRINCIPAL"-content-1""\", variant {approved}, null)")
passed
dfx canister call modclub reserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-2""\")"
dfx identity use mod_test
echo "2"
dfx canister call modclub reserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
RESULT3=$(dfx canister call modclub vote "(\""$MODPROVIDER_PRINCIPAL"-content-1""\", variant {approved}, null)")
passed
dfx identity use mod_test_3
echo "3"
dfx canister call modclub reserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
RESULT4=$(dfx canister call modclub vote "(\""$MODPROVIDER_PRINCIPAL"-content-1""\", variant {approved}, null)")
passed
echo "......#VOTE# Case 3 MUST FAILED (full)......."
dfx identity use mod_test_4
dfx canister call modclub canReserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
dfx canister call modclub reserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
dfx canister call modclub canReserveContent "(\""$MODPROVIDER_PRINCIPAL"-content-1""\")"
# failed
echo "......#VOTE# Case 4 MUST FAILED (TimeOut)......."
dfx identity use mod_test_2
echo "sleep for 100 s......"
secs=100
while [ $secs -gt 0 ]; do
   echo -ne "$secs\033[0K\r"
   sleep 1
   : $((secs--))
done
echo "Thank you for your patient..."
dfx canister call modclub vote "(\""$MODPROVIDER_PRINCIPAL"-content-2""\", variant {approved}, null)"
failed
echo "-------------------------------"
