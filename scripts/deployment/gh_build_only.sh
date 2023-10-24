#!/bin/bash
set -e

current_dir="$(dirname "$0")"
source "${current_dir}/../utils.sh"
source "${current_dir}/build_utils.sh"

dev_env="${ENV:-qa}"

printf "current DEV_ENV=${dev_env}"

create_canisters $dev_env && build_canisters $dev_env

