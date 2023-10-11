#!/bin/bash

# here is a quick way to check the balance of a subaccount dfx canister call wallet icrc1_balance_of '(record {owner=principal "<airdrop canister>"; subaccount= opt blob "00000000000000000000000000000001"})'

## adjust these fields to the environment
network="ic"
airdrop_canister_id="$(dfx canister id airdrop --network=$network)"
wallet_canister_id=$(dfx canister id wallet --network=$network)

get_token_amount() {
  local tokenIndex=$1
  local totalFee=120000  # 0.0012 multiplied by 10^8
  local scaleFactor=100000000  # 10^8

  if (( tokenIndex >= 0 && tokenIndex <= 99 )); then
    echo $(( (18333 * scaleFactor) + totalFee ))  # 18333 + 0.0012 (bronze plus 12 months worth of fees)
  elif (( tokenIndex >= 100 && tokenIndex <= 139 )); then
    echo $(( (91667 * scaleFactor) + totalFee ))  # 91667 + 0.0012 (silver plus 12 months worth of fees)
  elif (( tokenIndex >= 140 && tokenIndex <= 159 )); then
    echo $(( (366667 * scaleFactor) + totalFee ))  # 366667 + 0.0012 (gold plus 12 months worth of fees)
  else
    echo 0
  fi
}



for tokenIndex in {0..159}; do
  
  tokenAmount=$(get_token_amount $tokenIndex)

  # Generate the subaccount string, padded with zeros
  subaccount=$(printf "%032d" $tokenIndex)
  
  echo "-------------------------"
  echo "Token Index: $tokenIndex"
  echo "Subaccount: $subaccount"
  echo "Amount to Transfer: $tokenAmount"
  echo "-------------------------"

  # Confirmation before transfer
  read -p "Are you sure you want to transfer for token index $tokenIndex? (y/n) " -n 1 -r
  echo    # Move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    dfx canister call $wallet_canister_id icrc1_transfer "(record {to=record {owner=principal \"$airdrop_canister_id\"; subaccount= opt blob \"$subaccount\"}; fee=null; memo=null; from_subaccount=null; created_at_time=null; amount= $(echo "$tokenAmount" | bc) : nat})" --network=$network
  else
    echo "Transfer for token index $tokenIndex skipped."
  fi
done