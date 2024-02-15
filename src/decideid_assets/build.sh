#!/usr/bin/env bash
set -euo pipefail


# Make sure we always run from the issuer root
VC_ISSUER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$VC_ISSUER_DIR"

# Build the app
# pushd ../../
yarn install &&
yarn run build &&
cp ./assets/* ../../dist/decideid_assets &&
# popd

cargo build --release --target wasm32-unknown-unknown --manifest-path ./Cargo.toml -j1
ic-wasm "../../target/wasm32-unknown-unknown/release/decideid_assets.wasm" -o "./decideid_assets.wasm" shrink
ic-wasm decideid_assets.wasm -o decideid_assets.wasm metadata candid:service -f decideid_assets.did -v public
# indicate support for certificate version 1 and 2 in the canister metadata
ic-wasm decideid_assets.wasm -o decideid_assets.wasm metadata supported_certificate_versions -d "1,2" -v public
gzip --no-name --force "decideid_assets.wasm"
