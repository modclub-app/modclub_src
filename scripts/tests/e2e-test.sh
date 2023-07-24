#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

printf "${GREEN}[TEST] ${YELLOW}NEW E2E Test module...${NC}\n"

dfx identity use default

declare TOKEN_DECIMALS="_000_000"

# Expected balances
declare RESERVE_BALANCE="367_500_000$TOKEN_DECIMALS"
declare AIRDROP_BALANCE="10_000_000$TOKEN_DECIMALS"
declare MARKETING_BALANCE="50_000_000$TOKEN_DECIMALS"
declare ADVISORS_BALANCE="50_000_000$TOKEN_DECIMALS"
declare PRESEED_BALANCE="62_500_000$TOKEN_DECIMALS"
declare PUBLICSALE_BALANCE="100_000_000$TOKEN_DECIMALS"
declare MAIN_BALANCE="100_000_000$TOKEN_DECIMALS"
declare SEED_BALANCE="100_000_000$TOKEN_DECIMALS"
declare TEAM_BALANCE="160_000_000$TOKEN_DECIMALS"
declare -i TEMP_BALANCE=0

dfx identity use qa_ledger_identity
declare LEDGER_ACCOUNT=$(dfx identity get-principal)
declare MODCLUB_CANISTER_ID=$(dfx canister id modclub_qa)
dfx identity use default
declare DEPLOYER_ACCOUNT=$(dfx identity get-principal)
dfx ledger fabricate-cycles --canister modclub_qa
dfx ledger fabricate-cycles --canister modclub_qa

# Verify balances
function verify_balance() {
	dfx identity use default
	local icrc_sa_name=$1
	local expected_balance=$2
	local returned_balance=""
	if [[ "$icrc_sa_name" != "" ]]; then 
		returned_balance=$(dfx canister call wallet_qa icrc1_balance_of '(record { owner = principal "'$LEDGER_ACCOUNT'"; subaccount = opt blob "'$icrc_sa_name'"})')
	else
		returned_balance=$(dfx canister call wallet_qa icrc1_balance_of '(record { owner = principal "'$LEDGER_ACCOUNT'" })')
	fi

	if [[ "$returned_balance" == *"$expected_balance"* ]]; then
			echo "Balance for $icrc_sa_name is correct: $expected_balance"
	else
			echo "Balance for $icrc_sa_name is INCORRECT! Expected: $expected_balance, Returned: $returned_balance"
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

	echo "++++++++++Check Balance++++++++++"
	verify_balance "-------------------------RESERVE" $RESERVE_BALANCE
	verify_balance "-------------------------AIRDROP" $AIRDROP_BALANCE
	verify_balance "-----------------------MARKETING" $MARKETING_BALANCE
	verify_balance "------------------------ADVISORS" $ADVISORS_BALANCE
	verify_balance "-------------------------PRESEED" $PRESEED_BALANCE
	verify_balance "----------------------PUBLICSALE" $PUBLICSALE_BALANCE
	verify_balance "" $MAIN_BALANCE
	verify_balance "----------------------------SEED" $SEED_BALANCE
	verify_balance "----------------------------TEAM" $TEAM_BALANCE

	# create provider
	echo "+++++++++++++++++++ Step 1: create Provider"
	dfx identity new qa_test_provider
	dfx identity use qa_test_provider
	declare TEST_PROVIDER_PRINCIPAL=$(dfx identity get-principal)

	dfx identity use default
	dfx canister call auth_qa registerAdmin '(principal "'$DEPLOYER_ACCOUNT'")'
	dfx canister call modclub_qa addToAllowList '(principal "'$TEST_PROVIDER_PRINCIPAL'" )'

	dfx identity use qa_test_provider
	dfx canister call modclub_qa registerProvider '("TEMP_PROVIDER_NAME","TEMP_PROVIDER_DESCRIPTION", null)'
	dfx canister call modclub_qa addProviderAdmin '(principal "'$TEST_PROVIDER_PRINCIPAL'" , "TEMP_PROVIDER_NAME", null)'
	dfx canister call modclub_qa updateSettings '(principal "'$TEST_PROVIDER_PRINCIPAL'", record {requiredVotes=1; minStaked=0})'

	dfx identity use default
	echo "Transfering Tokens to QA_Provider main account..."
	# For imitation that Provider has some amount of Tokens
	dfx canister call wallet_qa transferToProvider '( record { from = record { owner = principal "'$LEDGER_ACCOUNT'" }; to = record { owner= principal "'$TEST_PROVIDER_PRINCIPAL'" }; amount = 10_000'$TOKEN_DECIMALS' })'

	# add mod token
	echo "+++++++++++++++++++ Step 2: Mod tokens +++++++++++++++++++"
	dfx identity use qa_test_provider
	echo "Creating Approve..."
	dfx canister call wallet_qa icrc2_approve '( record { spender = principal "'$MODCLUB_CANISTER_ID'"; amount = 1000'$TOKEN_DECIMALS' } )'
	echo "TopUp Provider Subaccount..."
	dfx canister call modclub_qa topUpProviderReserve '( record { amount = 100'$TOKEN_DECIMALS' } )'
	dfx identity use default

	echo "Check Modclub canister balance"
	dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'" } )'

	dfx canister call modclub_qa setRandomization '(false)'

	# Submit a task and verify
	echo "+++++++++++++++++++ Step 3: Call submitText and check amount of tokens  +++++++++++++++++++"
	dfx identity use qa_test_provider
	echo "Check Provider RESERVE balance"
	declare P_BAL_BEFORE_SUBMIT=$(dfx canister call modclub_qa providerSaBalance '("RESERVE", null)')
	echo "Provider RESERVE balance: $P_BAL_BEFORE_SUBMIT"
	dfx canister call modclub_qa submitText '("01","Text", opt "TitleText")'

	echo "------- Check balance after call submitText ---------"
	declare PROV_RESERVE_AFTER_SUB_TEXT=$(dfx canister call modclub_qa providerSaBalance '("RESERVE", null)')
	echo "RESERVE balance: $PROV_RESERVE_AFTER_SUB_TEXT"

	if [[ "$PROV_RESERVE_AFTER_SUB_TEXT" != *"96_990_000"* ]]; then
			echo "RESERVE Balance after submitText is wrong: $PROV_RESERVE_AFTER_SUB_TEXT"
			source ./scripts/tests/infra/shutdown_test_infra.sh
			exit 1
	fi

	declare PROV_AP_AFTER_SUB_TEXT=$(dfx canister call modclub_qa providerSaBalance '("ACCOUNT_PAYABLE", null)')
	echo "ACCOUNT_PAYABLE balance: $PROV_AP_AFTER_SUB_TEXT"

	if [[ "$PROV_AP_AFTER_SUB_TEXT" != *"3_000_000"* ]]; then
			echo "AP Balance after submitText is wrong: $PROV_AP_AFTER_SUB_TEXT"
			source ./scripts/tests/infra/shutdown_test_infra.sh
			exit 1
	fi

	echo "+++++++++++++++++++ Step 3.2: Call submitHtmlContent and check amount of tokens +++++++++++++++++++"
	dfx canister call modclub_qa submitHtmlContent '("02","HTML", opt "TitleHTML")'

	echo "------- Check balance after call submitHtmlContent ---------"
	declare PROV_RESERVE_AFTER_SUB_HTML=$(dfx canister call modclub_qa providerSaBalance '("RESERVE", null)')
	echo "RESERVE balance: $PROV_RESERVE_AFTER_SUB_HTML"
	if [[ "$PROV_RESERVE_AFTER_SUB_HTML" != *"93_980_000"* ]]; then
			echo "RESERVE Balance after submitHtml is wrong: $PROV_RESERVE_AFTER_SUB_HTML"
			source ./scripts/tests/infra/shutdown_test_infra.sh
			exit 1
	fi

	declare PROV_AP_AFTER_SUB_HTML=$(dfx canister call modclub_qa providerSaBalance '("ACCOUNT_PAYABLE", null)')
	echo "ACCOUNT_PAYABLE balance: $PROV_AP_AFTER_SUB_HTML"
	if [[ "$PROV_AP_AFTER_SUB_HTML" != *"6_000_000"* ]]; then
			echo "AP Balance after submitText is wrong: $PROV_AP_AFTER_SUB_HTML"
			source ./scripts/tests/infra/shutdown_test_infra.sh
			exit 1
	fi

	echo "###### Step 5: create Moderator with Junior status ########"
	dfx identity use default
	dfx identity new qa_test_moderator
	dfx identity use qa_test_moderator
	declare TEST_J_MODERATOR_PRINCIPAL=$(dfx identity get-principal)
	dfx canister call modclub_qa registerModerator '("TEMP_MOD_JA", null,null)'

	echo "Check Moderator INITIAL balance"
	declare INITIAL_MODER_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" } )')
	echo "INITIAL balance: $INITIAL_MODER_BALANCE"

	dfx identity use default
	echo "Setting Reputation ..."
	dfx canister call rs_qa setRS '(principal "'$TEST_J_MODERATOR_PRINCIPAL'", 6900)'

	echo "Shuffle content ..."
	dfx canister call modclub_qa shuffleContent

	dfx identity use qa_test_moderator
	declare INITIAL_LEVEL=$(dfx canister call rs queryRSAndLevel)
	echo "INITIAL_LEVEL $INITIAL_LEVEL"
	dfx canister call modclub_qa getTasks '(0, 30, false)'

	echo "......#VOTE#......."
	for j in {1..2}
	do
		dfx canister call modclub_qa vote "(\""$TEST_PROVIDER_PRINCIPAL"-content-"$j"\", variant {approved}, null)"
	done
	declare NEW_LEVEL=$(dfx canister call rs queryRSAndLevel)

	echo "......#Check RS Level#......."
	echo "queryRSAndLevel From: $INITIAL_LEVEL"
	echo "To: $NEW_LEVEL"

	echo "queryRSAndLevelByPrincipal: "
	dfx canister call rs queryRSAndLevelByPrincipal "(principal \"$(dfx identity get-principal)\")"

	echo "----------Check Mod token----------"
	declare CURRENT_MODER_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" } )')
	echo "MODERATOR INITIAL balance: $INITIAL_MODER_BALANCE"
	echo "MODERATOR CURRENT balance: $CURRENT_MODER_BALANCE"
	echo "-------------------------------"

