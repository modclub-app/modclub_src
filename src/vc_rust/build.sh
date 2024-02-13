#!/usr/bin/env bash
set -euo pipefail


# Make sure we always run from the issuer root
VC_ISSUER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$VC_ISSUER_DIR"

# Build the app
pushd ../../
npm i --workspace ./src/vc_rust &&
npm run --workspace ./src/vc_rust build
# cp ./src/vc_rust/assets/* ./dist/vc_rust
popd

cargo build --release --target wasm32-unknown-unknown --manifest-path ./Cargo.toml -j1
ic-wasm "../../target/wasm32-unknown-unknown/release/vc_issuer.wasm" -o "./vc_issuer.wasm" shrink
ic-wasm vc_issuer.wasm -o vc_issuer.wasm metadata candid:service -f vc_issuer.did -v public
# indicate support for certificate version 1 and 2 in the canister metadata
ic-wasm vc_issuer.wasm -o vc_issuer.wasm metadata supported_certificate_versions -d "1,2" -v public
gzip --no-name --force "vc_issuer.wasm"

