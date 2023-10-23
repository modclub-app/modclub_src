#!/bin/bash

# script to only add contents
current_dir="$(dirname "$0")"
ROOT_DIR="$current_dir/../../"

source "${current_dir}/../utils.sh"
source "${current_dir}/../seeds/add_token.sh"
source "${current_dir}/../seeds/gen_content.sh"
source "${current_dir}/../seeds/gen_provider.sh"

modclub=$(get_canister_name_by_env qa "modclub")
dfx ledger fabricate-cycles --canister $modclub
dfx ledger fabricate-cycles --canister $modclub
dfx ledger fabricate-cycles --canister $modclub
dfx ledger fabricate-cycles --canister $modclub
dfx ledger fabricate-cycles --canister $modclub
dfx ledger fabricate-cycles --canister $modclub

LEDGER_IDENTITY="qa_ledger_identity"
PROVIDER_IDENTITY="qa_test_provider"
create_provider_identity $PROVIDER_IDENTITY
setup_provider qa $PROVIDER_IDENTITY
add_token_for_submitting_task qa $PROVIDER_IDENTITY $LEDGER_IDENTITY
create_text_content qa $PROVIDER_IDENTITY
create_html_content qa $PROVIDER_IDENTITY
# Additional ACCOUNT_PAYABLE tokens are required because content creation used up tokens.
add_token_to_ACCOUNT_PAYABLE qa $LEDGER_IDENTITY

dfx identity use default