#!/bin/bash

# here is a quick way to check the balance of a subaccount dfx canister call wallet icrc1_balance_of '(record {owner=principal "<airdrop canister>"; subaccount= opt blob "00000000000000000000000000000001"})'

## adjust these fields to the environment
network="local"
airdrop_canister_id="$(dfx canister id airdrop_qa --network=$network)"
wallet_canister_id=$(dfx canister id wallet_qa --network=$network)

get_token_amount() {
  local tokenIndex=$1
  local totalFee=1

  if (( tokenIndex >= 0 && tokenIndex <= 99 )); then
    echo "18333 + $totalFee"  # 18333 + 0.0012 (bronze plus 12 months worth of fees)
  elif (( tokenIndex >= 100 && tokenIndex <= 139 )); then
    echo "91667 + $totalFee"  # 91667 + 0.0012 (silver plus 12 months worth of fees)
  elif (( tokenIndex >= 140 && tokenIndex <= 159 )); then
    echo "366667 + $totalFee"  # 366667 + 0.0012 (gold plus 12 months worth of fees)
  else
    echo "0 + $totalFee"  # 0 + 0.0012 (none plus 12 months worth of fees)
  fi
}



for tokenIndex in {0..159}; do
  
  tokenAmount=$(get_token_amount $tokenIndex)

  # Generate the subaccount string, padded with zeros
  subaccount=$(printf "%032d" $tokenIndex)
  

echo "subaccount: $subaccount"
  
  dfx canister call $wallet_canister_id icrc1_transfer "(record {to=record {owner=principal \"$airdrop_canister_id\"; subaccount= opt blob \"$subaccount\"}; fee=null; memo=null; from_subaccount=null; created_at_time=null; amount= $(echo "$tokenAmount" | bc) : nat})" --network=$network
done
