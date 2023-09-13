#!/bin/bash
set -e
current_dir="$(dirname "$0")"

source "${current_dir}/../utils.sh"
source "${current_dir}/deployment_utils.sh"

deploy_canisters $DEV_ENV ic $OLD_MODCLUB_INSTANCE