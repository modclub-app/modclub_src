#!/bin/bash
export BYPASS_PROMPT_YES=yes
export DEV_ENV=qa
export OLD_MODCLUB_INSTANCE=la3yy-gaaaa-aaaah-qaiuq-cai
export NETWORK=local

rustup target add wasm32-unknown-unknown

dfx identity get-principal

# Start dfx
echo "Starting dfx"
dfx stop
dfx start --background

# Create Canisters
echo "Creating Canisters"
source scripts/up_infra.sh

# Run deployment script
create_qa_canisters && deploy_qa_canisters && init_qa_canisters && init_qa_content
dfx canister call modclub_qa adminInit
dfx canister call modclub_qa configurePohForProvider "(principal \"$(dfx canister id modclub_qa)\", vec {\"challenge-user-audio\";\"challenge-user-video\"}, 365, false)"
dfx canister call modclub_qa populateChallenges

# Seeding
echo "Seeding content"
dfx identity use default
./scripts/infra/seed_content.sh

# Run tests
echo "Running tests"
./scripts/deployment/gh_pr_pipeline_test_runner.sh

dfx identity use default

# Show success message
echo "Success!"