#!/bin/bash

echo "####################### Deploy started ###########################"
function get_local_canisters() {
  echo "variant { local = record { modclub_canister_id = principal \"$(dfx canister id modclub)\";old_modclub_canister_id = principal \"$(dfx canister id modclub)\";rs_canister_id = principal \"$(dfx canister id rs)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";auth_canister_id = principal \"$(dfx canister id auth)\";vesting_canister_id = principal \"$(dfx canister id vesting)\"; }}"
}
function get_qa_canisters() {
  echo "variant { local = record { modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; old_modclub_canister_id = principal \"$(dfx canister id modclub_qa)\"; rs_canister_id = principal \"$(dfx canister id rs_qa)\"; wallet_canister_id = principal \"$(dfx canister id wallet_qa)\"; auth_canister_id = principal \"$(dfx canister id auth_qa)\"; vesting_canister_id = principal \"$(dfx canister id vesting_qa)\"; }}"
}
function run_qa() {
  dfx canister create modclub_qa && dfx canister create wallet_qa && dfx canister create rs_qa && dfx canister create auth_qa && dfx canister create vesting_qa
  QA_ENV=$(get_qa_canisters)
  dfx deploy auth_qa --argument="($QA_ENV)"
  dfx deploy wallet_qa --argument="(record {
      env = $QA_ENV;
      ledgerInit = record {
        initial_mints = vec { 
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; }; amount = 100_000_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-------------------------RESERVE\"}; amount = 367_500_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-------------------------AIRDROP\"}; amount = 10_000_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-----------------------MARKETING\"}; amount = 50_000_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"------------------------ADVISORS\"}; amount = 50_000_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-------------------------PRESEED\"}; amount = 62_500_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"----------------------PUBLICSALE\"}; amount = 100_000_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"----------------------------SEED\"}; amount = 100_000_000_000_000; };
          record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"----------------------------TEAM\"}; amount = 160_000_000_000_000; };
        };
        minting_account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; };
        ledger_account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; };
        token_name = \"MODCLUB TEST TOKEN\";
        token_symbol = \"MODTEST\";
        decimals = 6;
        transfer_fee = 10_000;
      }}
  )"
  dfx deploy vesting_qa --argument="(record {env = $QA_ENV})"
  dfx deploy rs_qa --argument="($QA_ENV)"
  dfx deploy modclub_qa --argument="($QA_ENV)"
}
function run_local() {
  # dfx canister create modclub && dfx canister create wallet && dfx canister create rs && dfx canister create auth && dfx canister create vesting
  LOCAL_ENV=$(get_local_canisters)
  dfx deploy auth --argument="($LOCAL_ENV)"
  dfx deploy wallet --argument="(record {
    env = $LOCAL_ENV;
    ledgerInit = record {
      initial_mints = vec { 
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; }; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-------------------------RESERVE\"}; amount = 367_500_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-------------------------AIRDROP\"}; amount = 10_000_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-----------------------MARKETING\"}; amount = 50_000_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"------------------------ADVISORS\"}; amount = 50_000_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"-------------------------PRESEED\"}; amount = 62_500_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"----------------------PUBLICSALE\"}; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"----------------------------SEED\"}; amount = 100_000_000_000_000; };
        record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; subaccount = opt blob \"----------------------------TEAM\"}; amount = 160_000_000_000_000; };
      };
      minting_account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; };
      ledger_account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; };
      token_name = \"MODCLUB TEST TOKEN\";
      token_symbol = \"MODTEST\";
      decimals = 6;
      transfer_fee = 10_000;
    }}
)"
  dfx deploy vesting --argument="(record {env = $LOCAL_ENV})"
  dfx deploy rs --argument="($LOCAL_ENV)"
  dfx deploy modclub --argument="($LOCAL_ENV)"
}

# rm -rf ../.dfx
# dfx canister stop --all && dfx canister delete --all
dfx identity use default
DEFAULT_PRINCIPAL=$(dfx identity get-principal)
run_local
