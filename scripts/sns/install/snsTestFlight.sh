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

"$DIR/snsCanisters.sh" "$@"

if [ $? -eq 0 ]; then
    echo "snsCanisters.sh ran successfully."
else
    echo "snsCanisters.sh encountered an error."
    exit 1
fi

echo "All scripts ran successfully."
