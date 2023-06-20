#! bin/bash

cd ../
dfx canister create modclub && dfx canister create modclub_qa && dfx canister create modclub_dev
dfx canister create modclub_assets && dfx canister create modclub_qa_assets && dfx canister create modclub_dev_assets
dfx canister create wallet && dfx canister create wallet_qa && dfx canister create wallet_dev
dfx canister create rs && dfx canister create rs_qa && dfx canister create rs_dev
dfx canister create auth && dfx canister create auth_qa && dfx canister create auth_dev
dfx canister create provider
dfx generate