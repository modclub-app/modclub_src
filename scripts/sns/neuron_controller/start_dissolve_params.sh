#!/usr/bin/env bash

set -euo pipefail

export NEURON_ID=${1}
export MANAGE_CMD="(record {command = variant {Configure = record { operation = opt variant { StartDissolving = record {}} }}; neuron_id = ${NEURON_ID}:nat64;})"

echo "${MANAGE_CMD}"
