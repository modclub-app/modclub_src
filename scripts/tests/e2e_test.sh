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
function failed() {
    if [ $? -ne 0 ]; then
        echo -e "${GREEN}[CORRECT]${ENDCOLOR}  "
    else
        echo -e "${RED}[INCORRECT]${ENDCOLOR}  "
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
	if ! dfx identity use qa_test_provider >/dev/null 2>&1; then
		dfx identity new qa_test_provider --disable-encryption
		dfx identity use qa_test_provider
	fi

	declare TEST_PROVIDER_PRINCIPAL=$(dfx identity get-principal)

	dfx identity use default
	dfx canister call auth_qa registerAdmin '(principal "'$DEPLOYER_ACCOUNT'")'
	dfx canister call modclub_qa addToAllowList '(principal "'$TEST_PROVIDER_PRINCIPAL'" )'

	dfx identity use qa_test_provider
	dfx canister call modclub_qa registerProvider '("TEMP_PROVIDER_NAME","TEMP_PROVIDER_DESCRIPTION", null)'
	dfx canister call modclub_qa addProviderAdmin '(principal "'$TEST_PROVIDER_PRINCIPAL'" , "TEMP_PROVIDER_NAME", null)'
	dfx canister call modclub_qa updateSettings '(principal "'$TEST_PROVIDER_PRINCIPAL'", record {requiredVotes=1; minStaked=0})'

	dfx identity use qa_ledger_identity
	echo "Transfering Tokens to QA_Provider main account..."
	# For imitation that Provider has some amount of Tokens
	declare provider_topUp_result=$(dfx canister call wallet_qa icrc1_transfer '( record { from_subaccount = opt blob "-------------------------RESERVE"; to = record { owner = principal "'$TEST_PROVIDER_PRINCIPAL'" }; amount = 10_000'$TOKEN_DECIMALS' } )')
	echo "$provider_topUp_result"

	# add mod token
	echo "+++++++++++++++++++ Step 2: Mod tokens +++++++++++++++++++"
	dfx identity use qa_test_provider
	declare providerSaReserveRaw=$(dfx canister call modclub_qa getProviderSa '("RESERVE", null)')
	declare pSaReserve1=${providerSaReserveRaw#"(blob \""}
	declare pSaReserve=${pSaReserve1%"\")"}
	echo "${pSaReserve}"
	declare transfer_result=$(dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt blob "'$pSaReserve'" }; amount = 1_000_000_000 } )')
	declare transfer_result=$(dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt blob "'$pSaReserve'" }; amount = 1_000_000_000 } )')

	echo "Check Modclub canister balance"
	dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt blob "'$pSaReserve'" } )'
	dfx identity use default
	dfx canister call modclub_qa setRandomization '(false)'

	# Submit a task and verify
	echo "+++++++++++++++++++ Step 3: Call submitText and check amount of tokens  +++++++++++++++++++"
	dfx identity use qa_test_provider
	echo "Check Provider RESERVE balance"
	declare P_BAL_BEFORE_SUBMIT=$(dfx canister call modclub_qa providerSaBalance '("RESERVE", null)')
	echo "Provider RESERVE balance: $P_BAL_BEFORE_SUBMIT"
	

	echo "------- Check balance after call submitText ---------"
	declare PROV_RESERVE_AFTER_SUB_TEXT=$(dfx canister call modclub_qa providerSaBalance '("RESERVE", null)' | cut -d '(' -f 2 | cut -d " " -f 1)
	echo "RESERVE balance: $PROV_RESERVE_AFTER_SUB_TEXT"

	if [[ "$PROV_RESERVE_AFTER_SUB_TEXT" != "1000_000_000" ]]; then
		echo "RESERVE Balance after submitText is wrong: $PROV_RESERVE_AFTER_SUB_TEXT"
		# source ./scripts/infra/shutdown_infra.sh
		# exit 1
	fi

	declare PROV_AP_AFTER_SUB_TEXT=$(dfx canister call modclub_qa providerSaBalance '("ACCOUNT_PAYABLE", null)' | cut -d '(' -f 2 | cut -d " " -f 1)
	echo "ACCOUNT_PAYABLE balance: $PROV_AP_AFTER_SUB_TEXT"
	declare SUBMIT_01=$(dfx canister call modclub_qa submitText "(\""001"\",\"Text001\", opt \"TitleText001\",opt variant {simple})"| cut -d '(' -f 2 | cut -d ')' -f -1| cut -d '"' -f 2 | cut -d '"' -f -1)
	declare SUBMIT_02=$(dfx canister call modclub_qa submitText "(\""002"\",\"Text002\", opt \"TitleText002\",opt variant {simple})"| cut -d '(' -f 2 | cut -d ')' -f -1| cut -d '"' -f 2 | cut -d '"' -f -1)
	declare SUBMIT_03=$(dfx canister call modclub_qa submitText "(\""003"\",\"Text003\", opt \"TitleText003\",opt variant {simple})"| cut -d '(' -f 2 | cut -d ')' -f -1| cut -d '"' -f 2 | cut -d '"' -f -1)

	if [[ "$PROV_AP_AFTER_SUB_TEXT" != "699_999_990" ]]; then
		echo "AP Balance after submitText is wrong: $PROV_AP_AFTER_SUB_TEXT"
		# source ./scripts/infra/shutdown_infra.sh
		# exit 1
	fi

	echo "+++++++++++++++++++ Step 3.2: Call submitHtmlContent and check amount of tokens +++++++++++++++++++"
	dfx canister call modclub_qa submitHtmlContent '("02","HTML", opt "TitleHTML",opt variant {simple})'
	declare SUBMIT_04=$(dfx canister call modclub_qa submitHtmlContent '("02","HTML", opt "TitleHTML",opt variant {simple})'| cut -d '(' -f 2 | cut -d ')' -f -1| cut -d '"' -f 2 | cut -d '"' -f -1)

	echo "------- Check balance after call submitHtmlContent ---------"
	declare PROV_RESERVE_AFTER_SUB_HTML=$(dfx canister call modclub_qa providerSaBalance '("RESERVE", null)'| cut -d '(' -f 2 | cut -d " " -f 1)
	echo "RESERVE balance: $PROV_RESERVE_AFTER_SUB_HTML"
	if [[ "$PROV_RESERVE_AFTER_SUB_HTML" != "300_000_000" ]]; then
		echo "RESERVE Balance after submitHtml is wrong: $PROV_RESERVE_AFTER_SUB_HTML"
		# source ./scripts/infra/shutdown_infra.sh
		# exit 1
	fi

	declare PROV_AP_AFTER_SUB_HTML=$(dfx canister call modclub_qa providerSaBalance '("ACCOUNT_PAYABLE", null)')
	echo "ACCOUNT_PAYABLE balance: $PROV_AP_AFTER_SUB_HTML"
	if [[ "$PROV_AP_AFTER_SUB_HTML" != "6_000_000" ]]; then
		echo "AP Balance after submitText is wrong: $PROV_AP_AFTER_SUB_HTML"
		# source ./scripts/infra/shutdown_infra.sh
		# exit 1
	fi

	echo "###### Step 5: create Moderator with Junior status ########"
	dfx identity use default
	if ! dfx identity use qa_test_moderator >/dev/null 2>&1; then
		dfx identity new qa_test_moderator --disable-encryption
		dfx identity use qa_test_moderator
	fi
	declare TEST_J_MODERATOR_PRINCIPAL=$(dfx identity get-principal)
	dfx canister call modclub_qa registerModerator '("TEST_MOD", null,null)'

	echo "Check Moderator INITIAL balance"
	declare INITIAL_MODER_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" } )')
	echo "INITIAL balance: $INITIAL_MODER_BALANCE"

	if ! dfx identity use mod_test >/dev/null 2>&1; then
		dfx identity new mod_test --disable-encryption
		dfx identity use mod_test
	fi
	dfx canister call modclub_qa registerModerator '("TEMP_MOD_TEST", null,null)'
	declare MOD_PRINCIPAL=\"$(dfx identity get-principal)\"
	if ! dfx identity use mod_test_2 >/dev/null 2>&1; then
		dfx identity new mod_test_2 --disable-encryption
		dfx identity use mod_test_2
	fi
	dfx canister call modclub_qa registerModerator '("TEMP_MOD_TEST2", null,null)'
	declare MOD_PRINCIPAL2=\"$(dfx identity get-principal)\"
	dfx identity use default
	echo "Setting Reputation ..."
	dfx canister call rs_qa setRS '(principal "'$TEST_J_MODERATOR_PRINCIPAL'", 6900)'
	dfx canister call rs_qa setRS '(principal '"$MOD_PRINCIPAL2"', 6900)'
	echo "Shuffle content ..."
	dfx canister call modclub_qa shuffleContent

	dfx identity use qa_test_moderator
	declare INITIAL_LEVEL=$(dfx canister call rs_qa queryRSAndLevel)
	echo "INITIAL_LEVEL $INITIAL_LEVEL"
	dfx canister call modclub_qa getTasks '(0, 2, false)'

	echo "......#VOTE#......."
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_01'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_01'", variant {approved}, null)'
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_02'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_02'", variant {approved}, null)'
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_03'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_03'", variant {approved}, null)'

	declare NEW_LEVEL=$(dfx canister call rs_qa queryRSAndLevel)
	dfx identity use mod_test_2
	echo "......#VOTE#......."
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_01'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_01'", variant {approved}, null)'
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_02'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_02'", variant {approved}, null)'
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_03'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_03'", variant {approved}, null)'
	echo "......#Check RS Level#......."
	echo "queryRSAndLevel From: $INITIAL_LEVEL"
	echo "To: $NEW_LEVEL"

	echo "queryRSAndLevelByPrincipal: "
	dfx canister call rs_qa queryRSAndLevelByPrincipal "(principal \"$(dfx identity get-principal)\")"

	echo "----------Check Mod token----------"
	declare CURRENT_MODER_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$TEST_J_MODERATOR_PRINCIPAL'" } )')
	echo "MODERATOR INITIAL balance: $INITIAL_MODER_BALANCE"
	echo "MODERATOR CURRENT balance: $CURRENT_MODER_BALANCE"
	echo "-------------------------------"

	echo "###### Step 5: Check Moderator Deposit ########"
	declare SUB_MOD=$(dfx canister call modclub_qa getProfileById '(principal '"$MOD_PRINCIPAL"')' | grep -E 'record \{ "ACCOUNT_PAYABLE"; blob "[a-f0-9]+"' | head -n 1 | grep -oE 'blob "[a-f0-9]+"')
	declare INIT_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal '"$MOD_PRINCIPAL"'; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)

	echo  $INIT_MOD_BALANCE
	dfx identity use qa_ledger_identity
	dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal '"$MOD_PRINCIPAL"'}; amount = 100_000'$TOKEN_DECIMALS' } )'
	dfx identity use mod_test
	dfx canister call wallet_qa icrc1_transfer '( record { to = record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'}; amount = 10_000'$TOKEN_DECIMALS' } )'
	declare CUR_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)
	echo "Check current moderator balance: '$CUR_MOD_BALANCE' "
	check_greater $CUR_MOD_BALANCE $INIT_MOD_BALANCE 

	echo "###### Step 6: Check Moderator Stake ########"
	dfx identity use mod_test
	dfx canister call modclub_qa stakeTokens '(180_000_000)'
	declare STAKE_MOD_BALANCE=$(dfx canister call wallet_qa icrc1_balance_of '( record { owner = principal "'$MODCLUB_CANISTER_ID'"; subaccount = opt '"$SUB_MOD"'} )'| cut -d '(' -f2 | cut -d':' -f1)
	check_less $CUR_MOD_BALANCE $STAKE_MOD_BALANCE
	declare STAKE_MOD_VAL=$(dfx canister call vesting_qa staked_for '(record {owner = principal '"$MOD_PRINCIPAL"'})'| cut -d '(' -f2 | cut -d':' -f1)

	echo "###### Step 7: Check Moderator Claiming ########"
	dfx identity use default
	dfx canister call rs_qa setRS "(principal "$MOD_PRINCIPAL", 4995)"
	dfx identity use mod_test
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_01'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_01'", variant {approved}, null)'
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_02'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_02'", variant {approved}, null)'
	dfx canister call modclub_qa reserveContent '("'$SUBMIT_03'")'
	dfx canister call modclub_qa vote '("'$SUBMIT_03'", variant {approved}, null)'
	declare CLAIMS_MOD_VAL=$(dfx canister call vesting_qa locked_for '(record { owner = principal '"$MOD_PRINCIPAL"' })'| cut -d '(' -f2 | cut -d':' -f1)
	echo "Locked amount for: '$CLAIMS_MOD_VAL'" 
	declare CAN_CLAIM=$(dfx canister call modclub_qa canClaimLockedReward '(opt '"$CLAIMS_MOD_VAL"')'| grep -E 'canClaim = .*;' | grep -oE 'true|false')
	if [[ "$CAN_CLAIM" == "false" ]]; then
		printf "${RED}[Incorrect] Cannot claim ${NC}\n"
	fi
	declare CLAIM_REWARD=$(dfx canister call modclub_qa claimLockedReward '('"$CLAIMS_MOD_VAL"', null)')
	declare AFTER_CLAIMS_VAL=$(dfx canister call vesting_qa locked_for '(record { owner = principal '"$MOD_PRINCIPAL"' })'| cut -d '(' -f2 | cut -d':' -f1)
	check_less $AFTER_CLAIMS_VAL $CLAIMS_MOD_VAL

	dfx identity use mod_test_2
	declare CLAIMS_MOD2_VAL=$(dfx canister call vesting_qa locked_for '(record { owner = principal '"$MOD_PRINCIPAL2"' })'| cut -d '(' -f2 | cut -d':' -f1)
	echo "Locked amount for: '$CLAIMS_MOD2_VAL'" 
	declare CAN_CLAIM=$(dfx canister call modclub_qa canClaimLockedReward '(opt '"$CLAIMS_MOD2_VAL"')'| grep -E 'canClaim = .*;' | grep -oE 'true|false')
	if [[ "$CAN_CLAIM" != "false" ]]; then
		printf "${RED}[Incorrect] Should not able to Claim ${NC}\n"
	fi
	echo "############# MUST FAILED ##########"
	dfx canister call modclub_qa claimLockedReward '('"$CLAIMS_MOD2_VAL"', null)'
	failed
	declare AFTER_CLAIMS2_VAL=$(dfx canister call vesting_qa locked_for '(record { owner = principal '"$MOD_PRINCIPAL2"' })'| cut -d '(' -f2 | cut -d':' -f1)
	check_equal $AFTER_CLAIMS2_VAL $CLAIMS_MOD2_VAL