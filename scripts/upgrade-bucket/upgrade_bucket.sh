RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

env=""
network=""
bucketIds=""
canisterPostfix=""

function get_local_canisters() {
  echo "record { modclub_canister_id = principal \"$(dfx canister --network $network id modclub$canisterPostfix)\"; old_modclub_canister_id = principal \"t6rzw-2iaaa-aaaaa-aaama-cai\"; modclub_assets_canister_id = principal \"$(dfx canister id ${modclub_assets_canister_name} --network=${network})\"; rs_canister_id = principal \"$(dfx canister --network $network id rs$canisterPostfix)\"; wallet_canister_id = principal \"$(dfx canister --network $network id wallet$canisterPostfix)\"; auth_canister_id = principal \"$(dfx canister --network $network id auth$canisterPostfix)\"; vesting_canister_id = principal \"$(dfx canister --network $network id vesting$canisterPostfix)\"; decideid_assets_canister_id = principal \"$(dfx canister --network $network id decideid$(canisterPostfix)_assets)\"; }"
}

if [[ "$PWD" != *"scripts/upgrade-bucket"* ]]; then
    printf "${RED}YOU MUST RUN THIS SCRIPT FROM ${CYAN}'scripts/upgrade-bucket'${RED} DIRECTORY!${NC}\n"
    exit 1
fi

echo "Enter 'p' for production or 'd' for dev or 'qa' for QA or 'l' for local"
read env

case $env in 
    "p" | "P")
        echo "You have selected prod environment. Do you want to proceed? ('y' or 'n'))"
        read confirmation
        if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]
        then
            echo "Exiting the process"
            exit
        fi
        echo "*** WARNING! PRODUCTION BUILD AND DEPLOYMENT ***"
        network="ic"
        rm -rf canister_ids.json
    ;;
    "d" | "D")
        echo "*** DEV BUCKETS BUILD AND DEPLOYMENT ***"
        network="ic"
        canisterPostfix="_dev"
        rm -rf canister_ids.json
    ;;
    "qa" | "QA")
        echo "*** QA BUCKETS BUILD AND DEPLOYMENT ***"
        network="ic"
        canisterPostfix="_qa"
        rm -rf canister_ids.json
    ;;
    "l" | "L")
        echo "*** LOCAL BUILD AND DEPLOYMENT ***"
        network="local"
        canisterPostfix="_qa"
        rm -rf .dfx/local/canister_ids.json
    ;;

    *) echo "unknown ENVIRONMENT" && exit 1;;
esac

cd ../../
local_env=$(get_local_canisters)
echo "PLEASE COPY AND PASTE CANISTER IDs, ONE BY ONE ::"
canisterIDs=$(dfx canister call modclub${canisterPostfix} getAllDataCanisterIds '()' --network=$network) || exit 1
echo "$canisterIDs"
cd ./scripts/upgrade-bucket

addAnotherPrincipal="y"
while [ "$addAnotherPrincipal" = "y" ]
do
    echo "Enter a bucket id to upgrade"
    read id
    bucketIds+=$id
    bucketIds+=","
 
    echo ""

    echo "Do you want to add another bucket id? Enter y for yes, n for no."
    read addAnotherPrincipal
    if [ "$addAnotherPrincipal" = "Y" ]
    then
        addAnotherPrincipal="y"
    fi
    echo ""
done

rm -rf dfx.json

echo "Generating dfx.json and canister_ids.json"
buckets=$(node generateConfig.cjs "$bucketIds" "$env")

echo "deploying buckets ${buckets}"
dfx deploy --network $network --argument="($local_env)" $buckets