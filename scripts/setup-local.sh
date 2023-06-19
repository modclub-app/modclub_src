#! bin/bash

echo "####################### Deploy started ###########################"
rm -rf ../.dfx

dfx identity use default
DEFAULT_PRINCIPAL=$(dfx identity get-principal)
dfx canister create modclub && dfx canister create wallet && dfx canister create rs && dfx canister create auth
dfx deploy auth --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
dfx deploy wallet --argument="(record {
    env = variant { local = record{
      modclub_canister_id = principal \"$(dfx canister id modclub)\";
      wallet_canister_id = principal \"$(dfx canister id wallet)\";
      rs_canister_id = principal \"$(dfx canister id rs)\";
      auth_canister_id = principal \"$(dfx canister id auth)\";
    }};
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
dfx deploy rs --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
dfx deploy modclub --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
