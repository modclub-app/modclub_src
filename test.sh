#!/bin/bash
dfx deploy modclub_dev --argument='(variant {local = "rrkah-fqaaa-aaaaa-aaaaq-cai"})'
dfx deploy wallet_dev --argument='(variant {local = "rrkah-fqaaa-aaaaa-aaaaq-cai"})'
dfx deploy rs_dev --argument='(variant {local = "rrkah-fqaaa-aaaaa-aaaaq-cai"})'

#setup
dfx canister call wallet_dev registerAdmin '( principal "i47jd-kewyq-vcner-l4xf7-edf77-aw4xp-u2kpb-2qai2-6ie7k-tcngl-oqe" )'
dfx canister call wallet_dev tge

#balances
dfx canister call wallet_dev queryBalance '(opt "TREASURY")'
dfx canister call wallet_dev queryBalance '(opt "RESERVE")'
dfx canister call wallet_dev queryBalance '(opt "AIRDROP")'
dfx canister call wallet_dev queryBalance '(opt "MARKETING")'
dfx canister call wallet_dev queryBalance '(opt "ADVISORS")'
dfx canister call wallet_dev queryBalance '(opt "PRESEED")'
dfx canister call wallet_dev queryBalance '(opt "PUBLICSALE")'
dfx canister call wallet_dev queryBalance '(opt "MAIN")'
dfx canister call wallet_dev queryBalance '(opt "SEED")'
dfx canister call wallet_dev queryBalance '(opt "TEAM")'
dfx canister call wallet_dev queryBalance '(opt "AP")'
dfx canister call wallet_dev queryBalance '(opt "STAKE")'

#balances with Principal
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai", opt "TREASURY")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "RESERVE")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "AIRDROP")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "MARKETING")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "ADVISORS")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "PRESEED")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "PUBLICSALE")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "MAIN")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "SEED")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "TEAM")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "AP")'
dfx canister call wallet_dev queryBalancePr '(principal "rrkah-fqaaa-aaaaa-aaaaq-cai",opt "STAKE")'