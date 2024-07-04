#!/bin/bash

dfx stop && rm -rf .dfx && dfx start --clean --background &&  scripts/infra/up_infra.sh