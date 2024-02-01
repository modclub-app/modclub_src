#!/usr/bin/env bash
# For detailed explanation please see the GitHub Repo: https://github.com/dfinity/sns-testing/tree/main

set -euo pipefail

SCRIPT_DIR=$(dirname -- "${BASH_SOURCE[0]}")
cd  SCRIPT_DIR

. ./constants.sh normal

./update_rejection_cost_logic.sh
