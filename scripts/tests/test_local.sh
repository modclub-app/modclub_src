#!/bin/bash

export BYPASS_PROMPT_YES=yes
export DEV_ENV=qa
export OLD_MODCLUB_INSTANCE=la3yy-gaaaa-aaaah-qaiuq-cai
export NETWORK=local

echo "To rerun everything again and again, you need to redeploy every single time"

# Seeding
echo "Seeding content"
dfx identity use default
./scripts/infra/seed_content.sh

# Run tests
echo "Running tests"
./scripts/deployment/gh_pr_pipeline_test_runner.sh

if [ $? -eq 0 ]; then
  echo "Success!"
 else
   echo "Script failed"
   exit 1
fi