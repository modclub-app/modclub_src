#!/bin/bash

# Default network
network="local"

# Parse command-line arguments
for arg in "$@"
do
    case $arg in
        --network=*)
        network="${arg#*=}"
        shift 
        ;;
        *)
        shift 
        ;;
    esac
done

# Set the DFX_IC_COMMIT environment variable
export DFX_IC_COMMIT=82a53257ed63af4f602afdccddadc684df3d24de

# Run the dfx sns import command
dfx sns import

# Run the dfx sns download command
dfx sns download

if [ "$network" = "ic" ]; then
  sudo sns-cli deploy-testflight --network ic
else
  echo "Deploying to local network..."
  sudo sns-cli deploy-testflight
fi

echo "Record the developer neuronID and update snsConfig.cjs 👆"
