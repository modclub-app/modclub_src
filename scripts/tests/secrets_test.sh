#!/bin/bash
set -e

function check_canister_subscription() {
    local canister=$1
	local canister_id=$(dfx canister id $canister)
	local auth_subscribers=$(dfx canister call auth_qa getSubscriptions '()')
	local record_str='record {
        topic = "secrets";
        _actor = service "'$canister_id'";
        consumer = principal "'$canister_id'";
      };'

	if [[ "$auth_subscribers" != *"$record_str"* ]]; then
		printf "${GREEN}[TEST] ${RED}[FAILED] $canister IS NOT SUBSCRIBED TO AUTH_CANISTER for secrets topic !!!${NC}\n"
		echo $auth_subscribers
		exit 1
	fi
}

function check_auth_secrets() {
    local name=$1
    local value=$2
    local secrets=$(dfx canister call auth_qa getSecrets)
    local record_str="record { value = \"$value\"; name = \"$name\" }"
    if [[ "$secrets" != *"$record_str"* ]]; then
        printf "Failed to find secret record $name=$value."
		exit 1
	fi
}

dfx identity use default
check_canister_subscription modclub_qa
check_canister_subscription vesting_qa
check_canister_subscription rs_qa

dfx canister call auth_qa addSecret '(record { name = "my_secret_1"; value = "abcd" })'
dfx canister call auth_qa addSecret '(record { name = "my_secret_2"; value = "12345" })'

check_auth_secrets my_secret_1 "abcd"
check_auth_secrets my_secret_2 "12345"
