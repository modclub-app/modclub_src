#!/usr/bin/env bash
set -euo pipefail


# Make sure we always run from the issuer root
VC_ISSUER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$VC_ISSUER_DIR"

if [[ ! "$(command -v ic-wasm)" ]]
then
		echo "could not find ic-wasm"
		echo "Trying to install IC-WASM:"
		cargo install ic-wasm
fi

# Build the app
cd ../../ && yarn install &&
cd src/modclub_assets &&
yarn install &&
yarn run build &&
mkdir ../../dist/modclub_assets/shapes &&
cp ./assets/shapes/* ../../dist/modclub_assets/shapes &&
rsync -vt ./assets/* ../../dist/modclub_assets

cargo build --release --target wasm32-unknown-unknown --manifest-path ./Cargo.toml -j1 &&
cp ./target/wasm32-unknown-unknown/release/modclub_assets.wasm ./modclub_assets_bkp.wasm &&
ic-wasm "./target/wasm32-unknown-unknown/release/modclub_assets.wasm" -o "./modclub_assets.wasm" shrink &&
ic-wasm modclub_assets.wasm -o modclub_assets.wasm metadata candid:service -f modclub_assets.did -v public &&
# indicate support for certificate version 1 and 2 in the canister metadata
ic-wasm modclub_assets.wasm -o modclub_assets.wasm metadata supported_certificate_versions -d "1,2" -v public &&
gzip --no-name --force "modclub_assets.wasm"
