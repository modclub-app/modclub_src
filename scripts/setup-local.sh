#! bin/bash

rm -rf ../.dfx
echo "####################### Deploy started ###########################"

dfx canister create modclub && dfx canister create wallet && dfx canister create rs
dfx deploy modclub --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\";}})" 
dfx deploy wallet --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\";}})" 
dfx deploy rs --argument="(variant {local = record{modclub_canister_id = principal \"$(dfx canister id modclub)\";wallet_canister_id = principal \"$(dfx canister id wallet)\";rs_canister_id = principal \"$(dfx canister id rs)\";}})" 

