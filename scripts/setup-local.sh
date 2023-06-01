#! bin/bash

rm -rf ../.dfx
echo "####################### Deploy started ###########################"

dfx identity use default
DEFAULT_PRINCIPAL=$(dfx identity get-principal)
dfx canister create modclub && dfx canister create wallet && dfx canister create rs && dfx canister create auth
dfx deploy auth --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
dfx deploy wallet --argument="(record {
    env = variant {
        local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";
        wallet_canister_id = principal \"$(dfx canister id wallet)\";
        rs_canister_id = principal \"$(dfx canister id rs)\";
        auth_canister_id = principal \"$(dfx canister id auth)\";
    }};
    ledgerInit = record {
      initial_mints = vec { record { account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; }; amount = 10_000_000_000_000; }; };
      minting_account = record { owner = principal \"$DEFAULT_PRINCIPAL\"; };
      token_name = \"MODCLUB TEST TOKEN\";
      token_symbol = \"MODTEST\";
      decimals = 6;
      transfer_fee = 10_000;
    }}
)"
dfx deploy rs --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
dfx deploy modclub --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\"; auth_canister_id = principal \"$(dfx canister id auth)\";}})"
