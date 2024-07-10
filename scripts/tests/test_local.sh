#!/bin/bash

export BYPASS_PROMPT_YES=yes
export DEV_ENV=qa
export ENV=qa
export OLD_MODCLUB_INSTANCE=la3yy-gaaaa-aaaah-qaiuq-cai
export NETWORK=local

EXPORT LEDGER_IDENTITY="qa_ledger_identity"
EXPORT PLEDGER_MINTER_IDENTITY="qa_ledger_minter"
EXPORT PROVIDER_IDENTITY="qa_test_provider"

source ./scripts/infra/up_infra.sh

# Run tests
echo "Running tests"
./scripts/deployment/gh_pr_pipeline_test_runner.sh

if [ $? -eq 0 ]; then
  echo "Success!"
 else
   echo "Script failed"
   exit 1
fi
