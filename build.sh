#!/bin/bash
cd ..
cd internet-identity
dfx stop
rm -rf .dfx
pkill -9 dfx
pkill -9 icx-proxy
nohup dfx start &
echo "Internet Identity has started"
sleep 5
II_ENV=development dfx deploy --no-wallet --argument '(null)' &> output.txt
VAR=`grep "canister id:" output.txt`
parsed=(${VAR// / })
echo "Identity canister id: ${parsed[6]}"
canister_id=${parsed[6]}

rm -f ouput.txt
rm -f onhup.out
sleep 1

cd ..
cd modclub
dfx stop
rm -rf .dfx
touch generated.config.json
echo "{\"IDENTITY_CANISTER\":$canister_id}" &> generated.config.json

echo "Deploying modclub canisters ..."
dfx deploy &> output.txt
sleep 5

modclub=`grep "\"modclub\" canister created with canister id:" output.txt`

parsed=(${modclub// / })

modclub_canister_id=${parsed[6]}

modclub_assets=`grep "\"modclub_assets\" canister created with canister id:" output.txt`

parsed=(${modclub_assets// / })

modclub_assets_canister_id=${parsed[6]}

modclub_dev=`grep "\"modclub_dev\" canister created with canister id:" output.txt`

parsed=(${modclub_dev// / })

modclub_dev_canister_id=${parsed[6]}


modclub_dev_assets=`grep "\"modclub_dev_assets\" canister created with canister id:" output.txt`

parsed=(${modclub_dev_assets// / })

modclub_dev_assets_canister_id=${parsed[6]}

echo "modclub CANISTER ID: ${modclub_canister_id}"
echo "modclub_assets CANISTER ID: ${modclub_assets_canister_id}"
echo "modclub_dev CANISTER ID: ${modclub_dev_canister_id}"
echo "modclub_dev_assets CANISTER ID: ${modclub_dev_assets_canister_id}"



rm -rf output.txt