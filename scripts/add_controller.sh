#!/bin/bash

# Check the number of arguments
if [ $# -ne 2 ]; then
  echo "Usage: $0 <environment> <principal_id>"
  echo "Example: $0 dev vkmwz-imyx6-ko6ny-r7ms4-5dktv-g64sy-7eaak-j6bsx-34wrs-hioyk-rqe"
  exit 1
fi

# Variables
ENV=$1
PRINCIPAL_ID=$2

# Canister list
CANISTERS=("modclub" "auth" "rs" "vesting", "decideid")

# Check if environment is production
if [ "$ENV" != "prod" ]
then
  CANISTERS=("${CANISTERS[@]/%/_$ENV}")
  CANISTERS+=("modclub_${ENV}_assets")
else
  CANISTERS+=("modclub_assets")
fi

# Iterate over canisters and issue commands
for CANISTER in ${CANISTERS[@]}; do
  echo "Processing canister $CANISTER"
  echo "Updating settings for $CANISTER"
  dfx canister --network ic update-settings $CANISTER --add-controller "$PRINCIPAL_ID"
  echo "Finished updating settings for $CANISTER"
  # For modclub assets.depricated canister, additional authorize command is issued
  if [[ "$CANISTER" == *"assets"* ]]
  then
    echo "Authorizing principal for $CANISTER"
    dfx canister --network ic call $CANISTER authorize '(principal "'$PRINCIPAL_ID'")'
    echo "Finished authorizing principal for $CANISTER"
  fi
done

# Example
# ./add_controller.sh dev "vkmwz-imyx6-ko6ny-r7ms4-5dktv-g64sy-7eaak-j6bsx-34wrs-hioyk-rqe"
