env="l"
network="local"

bucketIds=""

echo "Enter 'p' for production or 's' for staging or 'l' for local"
read env

# echo "Enter 'u' for upgrade (Default), 'i' for install, or 'r' for reinstall (WARNING: ALL DATA WILL BE LOST)"
# read mode
# echo ""

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

echo $bucketIds
rm -rf dfx.json
echo "Generating dfx.json and canister_id.json"
node generateConfig.cjs "$bucketIds" "$env"


if [ "$env" = "p" ] || [ "$env" = "P" ] || [ "$env" = "s" ] || [ "$env" = "S" ] 
then
    network="ic"
    rm -rf canister_ids.json
    echo "*** PRODUCTION BUILD AND DEPLOYMENT ***"
else
    network="local"
    rm -rf .dfx/local/canister_ids.json
    echo "*** LOCAL BUILD AND DEPLOYMENT ***"
fi
echo "deploying bucket"
dfx deploy --network $network