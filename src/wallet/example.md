# Wallet Canister deploy example

```
dfx deploy wallet --mode=reinstall --argument '(record {
    env = variant { local = record {
      modclub_canister_id = principal "ryjl3-tyaaa-aaaaa-aaaba-cai";
      rs_canister_id = principal "rno2w-sqaaa-aaaaa-aaacq-cai";
      wallet_canister_id = principal "renrk-eyaaa-aaaaa-aaada-cai";
      auth_canister_id = principal "rrkah-fqaaa-aaaaa-aaaaq-cai";
    }};
    ledgerInit = record {
      initial_mints = vec {
				record { account = record { owner = principal "dt3sz-yjb25-s3cmv-bfsxp-63y7d-2dx7v-yda2t-ujzq6-yr7nz-ty2ed-2ae"; }; amount = 10_000_000_000_000; };
				record { account = record { owner = principal "dt3sz-yjb25-s3cmv-bfsxp-63y7d-2dx7v-yda2t-ujzq6-yr7nz-ty2ed-2ae"; subacount = opt blob "--------------------------------" }; amount = 10_000_000_000_000; };
			};
      minting_account = record { owner = principal "dt3sz-yjb25-s3cmv-bfsxp-63y7d-2dx7v-yda2t-ujzq6-yr7nz-ty2ed-2ae"; };
      token_name = "MODCLUB TOKEN";
      token_symbol = "MODTOKEN";
      decimals = 6;
      transfer_fee = 10_000;
    }}
  )'
```
