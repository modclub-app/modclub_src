#!/usr/bin/env bash

set -euo pipefail

NEURON_ID=${1:-}
DELAY_SECONDS=${2:-}
MANAGE_CMD="(record {command = variant {Configure=record {operation = opt variant {IncreaseDissolveDelay = record { additional_dissolve_delay_seconds =  $DELAY_SECONDS:nat32 }}}}; neuron_id = ${NEURON_ID}:nat64;})"

echo "${MANAGE_CMD}"
