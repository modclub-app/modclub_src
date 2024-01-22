#!/bin/bash

# Get the directory of the current script
DIR="$(dirname "$0")"

"$DIR/install.sh"
if [ $? -eq 0 ]; then
    echo "install.sh ran successfully."
else
    echo "install.sh encountered an error."
    exit 1
fi

"$DIR/move.sh"
if [ $? -eq 0 ]; then
    echo "move.sh ran successfully."
else
    echo "move.sh encountered an error."
    exit 1
fi

"$DIR/sns_canisters.sh" "$@"

if [ $? -eq 0 ]; then
    echo "sns_canisters.sh ran successfully."
else
    echo "sns_canisters.sh encountered an error."
    exit 1
fi

echo "All scripts ran successfully."
